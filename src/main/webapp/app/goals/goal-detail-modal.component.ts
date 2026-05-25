import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { GoalService } from './goal.service';
import { IGoal, IGoalMilestone, IGoalUpdate, GoalMilestoneStatus } from './goal.model';
import { GoalReviewModalComponent } from './goal-review-modal.component';
import { ConfirmationModalComponent } from 'app/home/confirmation-modal.component';

@Component({
  selector: 'jhi-goal-detail-modal',
  templateUrl: './goal-detail-modal.component.html',
  imports: [SharedModule, FormsModule],
})
export class GoalDetailModalComponent implements OnInit {
  @Input() goal!: IGoal;

  activeModal = inject(NgbActiveModal);
  private goalService = inject(GoalService);
  private modalService = inject(NgbModal);
  private accountService = inject(AccountService);

  milestones = signal<IGoalMilestone[]>([]);
  updates = signal<IGoalUpdate[]>([]);
  isLoadingMilestones = signal(false);
  isLoadingUpdates = signal(false);
  activeTab: 'milestones' | 'updates' = 'milestones';

  // Add milestone inline
  showAddMilestone = false;
  newMilestoneTitle = '';
  isSavingMilestone = false;

  milestoneStatuses: GoalMilestoneStatus[] = ['NOT_STARTED','IN_PROGRESS','COMPLETED','SKIPPED','BLOCKED'];

  account = this.accountService.trackCurrentAccount();

  /** True when the current user has the ROLE_CHILD authority. */
  isChild = computed(() => {
    const authorities = (this.account()?.authorities ?? [])
      .map(a => (a ?? '').toString().trim().toUpperCase());
    return authorities.includes('ROLE_CHILD') || authorities.includes('CHILD');
  });

  currentUserLogin = computed(() => this.account()?.login ?? null);

  canEditGoal(): boolean {
    if (this.isChild()) {
      return this.isChildOwnGoal();
    }
    const isOwner = this.isOwnedByCurrentUser();
    return isOwner || (!!this.goal?.sharedWithMe && !!this.goal?.canEditShared);
  }

  canManageGoal(): boolean {
    if (this.isChild()) {
      return this.isChildOwnGoal();
    }
    return this.canEditGoal();
  }

  private isChildOwnGoal(): boolean {
    const currentLogin = this.currentUserLogin();
    const ownerLogin = this.goal?.owner?.user?.login ?? null;
    if (currentLogin && ownerLogin) {
      return ownerLogin === currentLogin;
    }
    return !this.goal?.sharedWithMe;
  }

  private isOwnedByCurrentUser(): boolean {
    const currentLogin = this.currentUserLogin();
    const ownerLogin = this.goal?.owner?.user?.login ?? null;
    if (currentLogin && ownerLogin) {
      return ownerLogin === currentLogin;
    }
    return !this.goal?.sharedWithMe;
  }

  ngOnInit(): void {
    this.loadMilestones();
    this.loadUpdates();
  }

  loadMilestones(): void {
    this.isLoadingMilestones.set(true);
    this.goalService.getMilestones(this.goal.id).subscribe({
      next: data => {
        this.milestones.set(data);
        this.isLoadingMilestones.set(false);
      },
      error: () => this.isLoadingMilestones.set(false),
    });
  }

  loadUpdates(): void {
    this.isLoadingUpdates.set(true);
    this.goalService.getGoalUpdates(this.goal.id).subscribe({
      next: data => {
        this.updates.set(data);
        this.isLoadingUpdates.set(false);
      },
      error: () => this.isLoadingUpdates.set(false),
    });
  }

  addMilestone(): void {
    if (!this.newMilestoneTitle.trim()) return;
    this.isSavingMilestone = true;
    this.goalService.createMilestone(this.goal.id, {
      title: this.newMilestoneTitle.trim(),
      status: 'NOT_STARTED',
      sortOrder: this.milestones().length + 1,
    }).subscribe({
      next: () => {
        this.newMilestoneTitle = '';
        this.showAddMilestone = false;
        this.isSavingMilestone = false;
        this.loadMilestones();
      },
      error: () => { this.isSavingMilestone = false; },
    });
  }

  toggleMilestoneStatus(milestone: IGoalMilestone): void {
    const nextStatus: GoalMilestoneStatus = milestone.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';
    this.goalService.updateMilestone(this.goal.id, milestone.id, {
      ...milestone,
      status: nextStatus,
    }).subscribe({
      next: () => this.loadMilestones(),
    });
  }

  deleteMilestone(milestone: IGoalMilestone): void {
    const ref = this.modalService.open(ConfirmationModalComponent, { centered: true });
    ref.componentInstance.title = 'goals.deleteMilestone';
    ref.componentInstance.message = 'goals.confirmDeleteMilestone';
    ref.componentInstance.confirmButtonClass = 'btn-danger';
    ref.result.then(
      result => {
        if (result === 'confirmed') {
          this.goalService.deleteMilestone(this.goal.id, milestone.id).subscribe({
            next: () => this.loadMilestones(),
          });
        }
      },
      () => {},
    );
  }

  openReview(): void {
    const ref = this.modalService.open(GoalReviewModalComponent, { size: 'lg', centered: true });
    ref.componentInstance.goal = this.goal;
    ref.result.then(
      result => {
        if (result) {
          this.activeModal.close(result); // close with updated goal
        }
      },
      () => {},
    );
  }

  milestoneCompletedCount(): number {
    return this.milestones().filter(m => m.status === 'COMPLETED').length;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      COMPLETED: 'badge-completed',
      IN_PROGRESS: 'badge-in-progress',
      BLOCKED: 'badge-blocked',
      SKIPPED: 'badge-skipped',
      NOT_STARTED: 'badge-not-started',
    };
    return map[status] ?? 'bg-secondary';
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}

