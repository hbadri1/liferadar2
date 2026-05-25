import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { ConfirmationModalComponent } from 'app/home/confirmation-modal.component';
import { GoalService } from './goal.service';
import { GoalFormModalComponent } from './goal-form-modal.component';
import { GoalDetailModalComponent } from './goal-detail-modal.component';
import { GoalReviewModalComponent } from './goal-review-modal.component';
import {
  IGoal, IGoalDashboardSummary, GoalStatus, GoalType,
  GoalPriority, GoalCategory
} from './goal.model';
import dayjs from 'dayjs/esm';

type FilterStatus = GoalStatus | 'ALL';
type FilterPriority = GoalPriority | 'ALL';
type FilterType = GoalType | 'ALL';

@Component({
  selector: 'jhi-goals',
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss',
  imports: [SharedModule, FormsModule],
})
export default class GoalsComponent implements OnInit {
  goals = signal<IGoal[]>([]);
  summary = signal<IGoalDashboardSummary | null>(null);
  isLoading = signal(false);
  isLoadingSummary = signal(false);
  errorMsg = signal<string | null>(null);
  showArchived = signal(false);


  filterStatusValue: FilterStatus = 'ALL';
  filterPriorityValue: FilterPriority = 'ALL';
  filterTypeValue: FilterType = 'ALL';

  account = inject(AccountService).trackCurrentAccount();

  isChild = computed(() => {
    const authorities = (this.account()?.authorities ?? []).map(a => (a ?? '').toString().trim().toUpperCase());
    return authorities.includes('ROLE_CHILD') || authorities.includes('CHILD');
  });

  currentUserLogin = computed(() => this.account()?.login ?? null);

  canEdit = computed(() => {
    const authorities = (this.account()?.authorities ?? []).map(a => (a ?? '').toString().trim().toUpperCase());
    return (
      authorities.includes('ROLE_USER') || authorities.includes('USER') ||
      authorities.includes('ROLE_PARENT') || authorities.includes('PARENT') ||
      authorities.includes('ROLE_CHILD') || authorities.includes('CHILD') ||
      authorities.includes('ROLE_ADMIN') || authorities.includes('ADMIN')
    );
  });

  /** Per-goal check: can the current user edit this specific goal? */
  canEditGoal(goal: IGoal): boolean {
    // Children can only edit goals they own
    if (this.isChild()) {
      return this.isChildOwnGoal(goal);
    }

    // Parents/Admins can edit if they own it or if it's shared with canEditShared=true
    const isOwner = this.isOwnedByCurrentUser(goal);
    return isOwner || (!!goal.sharedWithMe && !!goal.canEditShared);
  }

  /** Management actions (edit/archive/delete). Children can only manage their own goals. */
  canManageGoal(goal: IGoal): boolean {
    if (this.isChild()) {
      return this.isChildOwnGoal(goal);
    }
    return this.canEditGoal(goal);
  }

  private isChildOwnGoal(goal: IGoal): boolean {
    const currentLogin = this.currentUserLogin();
    const ownerLogin = goal.owner?.user?.login ?? null;
    if (currentLogin && ownerLogin) {
      return ownerLogin === currentLogin;
    }
    // If owner login is missing in payload, treat non-shared goals as the child's own goals.
    return !goal.sharedWithMe;
  }

  private isOwnedByCurrentUser(goal: IGoal): boolean {
    const currentLogin = this.currentUserLogin();
    const ownerLogin = goal.owner?.user?.login ?? null;
    if (currentLogin && ownerLogin) {
      return ownerLogin === currentLogin;
    }
    // Fallback for payloads where owner login is omitted: non-shared entries are owned by current user.
    return !goal.sharedWithMe;
  }

  filteredGoals = computed(() => {
    let list = this.goals();
    if (this.filterStatusValue !== 'ALL') {
      list = list.filter(g => g.status === this.filterStatusValue);
    }
    if (this.filterPriorityValue !== 'ALL') {
      list = list.filter(g => g.priority === this.filterPriorityValue);
    }
    if (this.filterTypeValue !== 'ALL') {
      list = list.filter(g => g.goalType === this.filterTypeValue);
    }
    return list;
  });

  get filteredGoalsList(): IGoal[] {
    let list = this.goals();
    if (this.filterStatusValue !== 'ALL') {
      list = list.filter(g => g.status === this.filterStatusValue);
    }
    if (this.filterPriorityValue !== 'ALL') {
      list = list.filter(g => g.priority === this.filterPriorityValue);
    }
    if (this.filterTypeValue !== 'ALL') {
      list = list.filter(g => g.goalType === this.filterTypeValue);
    }
    return list;
  }

  private goalService = inject(GoalService);
  private modalService = inject(NgbModal);

  readonly statuses: FilterStatus[] = ['ALL','DRAFT','NOT_STARTED','IN_PROGRESS','ON_HOLD','BLOCKED','AT_RISK','COMPLETED','CANCELLED','ARCHIVED'];
  readonly priorities: FilterPriority[] = ['ALL','LOW','MEDIUM','HIGH','CRITICAL'];
  readonly goalTypes: FilterType[] = ['ALL','PERSONAL','FAMILY','CAREER','HEALTH','FINANCIAL','SPIRITUAL','LEARNING','RELATIONSHIP','TRAVEL','PROJECT','CUSTOM'];
  readonly today = dayjs().format('YYYY-MM-DD');

  ngOnInit(): void {
    this.loadGoals();
    this.loadSummary();
  }

  loadGoals(): void {
    this.isLoading.set(true);
    this.errorMsg.set(null);
    this.goalService.getMyGoals(this.showArchived()).subscribe({
      next: data => {
        this.goals.set(this.sortGoals(data));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMsg.set('goals.errors.loadFailed');
      },
    });
  }

  loadSummary(): void {
    this.isLoadingSummary.set(true);
    this.goalService.getDashboardSummary().subscribe({
      next: data => {
        this.summary.set(data);
        this.isLoadingSummary.set(false);
      },
      error: () => this.isLoadingSummary.set(false),
    });
  }

  toggleArchived(): void {
    this.showArchived.set(!this.showArchived());
    this.loadGoals();
  }

  openCreateGoal(): void {
    const ref = this.modalService.open(GoalFormModalComponent, { size: 'lg', centered: true, scrollable: true });
    ref.result.then(
      (result: IGoal) => {
        if (result) {
          this.loadGoals();
          this.loadSummary();
        }
      },
      () => {},
    );
  }

  openEditGoal(goal: IGoal, event: Event): void {
    event.stopPropagation();
    const ref = this.modalService.open(GoalFormModalComponent, { size: 'lg', centered: true, scrollable: true });
    ref.componentInstance.goal = goal;
    ref.result.then(
      (result: IGoal) => {
        if (result) {
          this.loadGoals();
          this.loadSummary();
        }
      },
      () => {},
    );
  }

  openGoalDetail(goal: IGoal): void {
    const ref = this.modalService.open(GoalDetailModalComponent, { size: 'xl', centered: true, scrollable: true });
    ref.componentInstance.goal = goal;
    ref.result.then(
      (result: IGoal) => {
        if (result) {
          this.loadGoals();
          this.loadSummary();
        }
      },
      () => {},
    );
  }

  openReviewGoal(goal: IGoal, event: Event): void {
    event.stopPropagation();
    const ref = this.modalService.open(GoalReviewModalComponent, { size: 'lg', centered: true });
    ref.componentInstance.goal = goal;
    ref.result.then(
      (result: IGoal) => {
        if (result) {
          this.loadGoals();
          this.loadSummary();
        }
      },
      () => {},
    );
  }

  archiveGoal(goal: IGoal, event: Event): void {
    event.stopPropagation();
    const ref = this.modalService.open(ConfirmationModalComponent, { centered: true });
    ref.componentInstance.title = 'goals.archiveGoal';
    ref.componentInstance.message = 'goals.confirmArchiveGoal';
    ref.componentInstance.confirmButtonClass = 'btn-warning';
    ref.result.then(result => {
      if (result === 'confirmed') {
        this.goalService.archiveGoal(goal.id).subscribe(() => {
          this.loadGoals();
          this.loadSummary();
        });
      }
    }, () => {});
  }

  markComplete(goal: IGoal, event: Event): void {
    event.stopPropagation();
    this.goalService.markComplete(goal.id).subscribe(() => {
      this.loadGoals();
      this.loadSummary();
    });
  }

  deleteGoal(goal: IGoal, event: Event): void {
    event.stopPropagation();
    const ref = this.modalService.open(ConfirmationModalComponent, { centered: true });
    ref.componentInstance.title = 'goals.deleteGoal';
    ref.componentInstance.message = 'goals.confirmDeleteGoal';
    ref.componentInstance.confirmButtonClass = 'btn-danger';
    ref.result.then(result => {
      if (result === 'confirmed') {
        this.goalService.deleteGoal(goal.id).subscribe(() => {
          this.loadGoals();
          this.loadSummary();
        });
      }
    }, () => {});
  }

  isAtRisk(goal: IGoal): boolean {
    if (goal.status === 'COMPLETED' || goal.status === 'CANCELLED' || goal.status === 'ARCHIVED') return false;
    if (goal.status === 'BLOCKED') return true;
    if (goal.targetDate && goal.targetDate < this.today) return true;
    if (goal.targetDate) {
      const daysLeft = dayjs(goal.targetDate).diff(dayjs(), 'day');
      if (daysLeft <= 7 && (goal.progressPercentage ?? 0) < 80) return true;
    }
    return goal.confidenceLevel === 'LOW' && goal.status === 'IN_PROGRESS';
  }

  isOverdue(goal: IGoal): boolean {
    return !!goal.targetDate && goal.targetDate < this.today &&
      goal.status !== 'COMPLETED' && goal.status !== 'CANCELLED' && goal.status !== 'ARCHIVED';
  }

  needsReview(goal: IGoal): boolean {
    return !!goal.nextReviewDate && goal.nextReviewDate <= this.today;
  }

  progressBarClass(goal: IGoal): string {
    const p = goal.progressPercentage ?? 0;
    if (goal.status === 'COMPLETED') return 'bg-success';
    if (this.isAtRisk(goal)) return 'bg-danger';
    if (p >= 75) return 'bg-success';
    if (p >= 40) return 'bg-info';
    return 'bg-warning';
  }

  statusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      COMPLETED: 'bg-success',
      IN_PROGRESS: 'bg-primary',
      NOT_STARTED: 'bg-secondary',
      DRAFT: 'bg-light text-dark border',
      ON_HOLD: 'bg-warning text-dark',
      BLOCKED: 'bg-danger',
      AT_RISK: 'bg-danger',
      CANCELLED: 'bg-secondary',
      ARCHIVED: 'bg-secondary',
    };
    return map[status] ?? 'bg-secondary';
  }

  priorityBadgeClass(priority: string): string {
    const map: Record<string, string> = {
      CRITICAL: 'bg-danger',
      HIGH: 'bg-warning text-dark',
      MEDIUM: 'bg-info text-dark',
      LOW: 'bg-light text-dark border',
    };
    return map[priority] ?? 'bg-secondary';
  }

  private sortGoals(goals: IGoal[]): IGoal[] {
    const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return [...goals].sort((a, b) => {
      // Completed + Archived last
      const aFinal = a.status === 'COMPLETED' || a.status === 'ARCHIVED' || a.status === 'CANCELLED' ? 1 : 0;
      const bFinal = b.status === 'COMPLETED' || b.status === 'ARCHIVED' || b.status === 'CANCELLED' ? 1 : 0;
      if (aFinal !== bFinal) return aFinal - bFinal;
      // At risk first
      const aRisk = this.isAtRisk(a) ? 0 : 1;
      const bRisk = this.isAtRisk(b) ? 0 : 1;
      if (aRisk !== bRisk) return aRisk - bRisk;
      // Priority
      const aPri = priorityOrder[a.priority] ?? 99;
      const bPri = priorityOrder[b.priority] ?? 99;
      return aPri - bPri;
    });
  }
}

