import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import dayjs from 'dayjs/esm';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import TimeUntilExpiryPipe from 'app/shared/date/time-until-expiry.pipe';
import { Authority } from 'app/config/authority.constants';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { ITripPlan } from 'app/entities/trip-plan/trip-plan.model';
import { TripPlanService } from 'app/entities/trip-plan/service/trip-plan.service';
import { IMyDocument } from 'app/my-documents/my-document.model';
import { MyDocumentService } from 'app/my-documents/my-document.service';
import { ISaaSSubscription } from 'app/entities/saas-subscription/saas-subscription.model';
import { SaaSSubscriptionService } from 'app/entities/saas-subscription/service/saas-subscription.service';
import { EvaluationDecisionService } from 'app/entities/evaluation-decision/service/evaluation-decision.service';
import { EvaluationDecisionCreateModalComponent } from 'app/home/evaluation-decision-create-modal.component';
import { AlertService } from 'app/core/util/alert.service';
import { GoalService } from 'app/goals/goal.service';
import { IGoal } from 'app/goals/goal.model';

interface PreparationAction {
  actionText: string;
  actionStatus: boolean;
}

interface TripActions {
  preparationActions?: PreparationAction[];
  duringTripActions?: PreparationAction[];
}

@Component({
  selector: 'jhi-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [SharedModule, TimeUntilExpiryPipe, EvaluationDecisionCreateModalComponent],
})
export default class HomeComponent implements OnInit, OnDestroy {
  account = signal<Account | null>(null);
  isLoading = signal<boolean>(false);

  // Coming Journey
  nearestTrip = signal<ITripPlan | null>(null);
  preparationActions = signal<PreparationAction[]>([]);
  completedActions = signal<Set<number>>(new Set());
  visiblePreparationActions = computed(() =>
    this.preparationActions()
      .map((action, index) => ({ action, index }))
      .filter(item => !this.completedActions().has(item.index)),
  );
  loadingTrip = signal<boolean>(false);

  // Expiring Documents
  expiringDocuments = signal<IMyDocument[]>([]);
  loadingDocuments = signal<boolean>(false);

  // Monthly Finances
  monthlyExpenses = signal<ISaaSSubscription[]>([]);
  monthlyTotal = signal<number>(0);
  loadingExpenses = signal<boolean>(false);
  currentMonth = computed(() => dayjs().format('MMMM YYYY'));

  // Kid objectives insights
  kidObjectives = signal<IGoal[]>([]);
  loadingKidObjectives = signal<boolean>(false);
  kidObjectiveInsights = computed(() => {
    const goals = this.kidObjectives();
    const now = dayjs().startOf('day');
    const soonThreshold = now.add(14, 'day');

    const active = goals.filter(goal => !['COMPLETED', 'CANCELLED', 'ARCHIVED'].includes(goal.status)).length;
    const completed = goals.filter(goal => goal.status === 'COMPLETED').length;
    const atRisk = goals.filter(goal => ['AT_RISK', 'BLOCKED'].includes(goal.status)).length;
    const dueSoon = goals.filter(goal => {
      if (!goal.targetDate || ['COMPLETED', 'CANCELLED', 'ARCHIVED'].includes(goal.status)) {
        return false;
      }
      const target = dayjs(goal.targetDate);
      return target.isAfter(now.subtract(1, 'day')) && target.isBefore(soonThreshold.add(1, 'day'));
    }).length;

    const topObjectives = goals
      .filter(goal => !['COMPLETED', 'CANCELLED', 'ARCHIVED'].includes(goal.status))
      .sort((a, b) => {
        const aDate = a.targetDate ? dayjs(a.targetDate).valueOf() : Number.MAX_SAFE_INTEGER;
        const bDate = b.targetDate ? dayjs(b.targetDate).valueOf() : Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      })
      .slice(0, 4);

    return {
      total: goals.length,
      active,
      completed,
      atRisk,
      dueSoon,
      topObjectives,
    };
  });

  // Auth checks
  isChildOnly = computed(() => {
    const authorities: string[] = this.account()?.authorities ?? [];
    return authorities.includes(Authority.CHILD) && !authorities.includes(Authority.PARENT) && !authorities.includes(Authority.ADMIN);
  });

  isFamilyAdmin = computed(() => {
    const authorities: string[] = this.account()?.authorities ?? [];
    return authorities.includes(Authority.PARENT);
  });

  private readonly destroy$ = new Subject<void>();

  private readonly accountService = inject(AccountService);
  private readonly tripPlanService = inject(TripPlanService);
  private readonly myDocumentService = inject(MyDocumentService);
  private readonly subscriptionService = inject(SaaSSubscriptionService);
  private readonly evaluationDecisionService = inject(EvaluationDecisionService);
  private readonly goalService = inject(GoalService);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);
  private readonly modalService = inject(NgbModal);
  private readonly alertService = inject(AlertService);

  ngOnInit(): void {
    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => {
        this.account.set(account);
        if (account) {
          this.loadDashboardData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    if (this.isChildOnly()) {
      this.loadKidObjectives();
      return;
    }

    this.loadNearestTrip();
    this.loadExpiringDocuments();
    this.loadMonthlyExpenses();
  }

  private loadKidObjectives(): void {
    this.loadingKidObjectives.set(true);
    this.goalService
      .getMyGoals(false)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: goals => {
          this.kidObjectives.set(goals ?? []);
          this.loadingKidObjectives.set(false);
        },
        error: () => {
          this.kidObjectives.set([]);
          this.loadingKidObjectives.set(false);
        },
      });
  }

  private loadNearestTrip(): void {
    this.loadingTrip.set(true);
    this.tripPlanService.query().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        const trips = response.body ?? [];
        const now = dayjs();

        // Find the nearest trip that is active or upcoming
        const sortedTrips = trips
          .filter(trip => trip.startDate)
          .sort((a, b) => {
            const dateA = dayjs(a.startDate);
            const dateB = dayjs(b.startDate);
            return Math.abs(dateA.diff(now)) - Math.abs(dateB.diff(now));
          });

        if (sortedTrips.length > 0) {
          const trip = sortedTrips[0];
          this.nearestTrip.set(trip);
          this.parsePreparationActions(trip);
        }
        this.loadingTrip.set(false);
      },
      error: () => {
        this.loadingTrip.set(false);
      },
    });
  }

  private parsePreparationActions(trip: ITripPlan): void {
    if (!trip.actionsJson) {
      this.preparationActions.set([]);
      return;
    }

    try {
      const tripActions: TripActions = JSON.parse(trip.actionsJson);
      const actions = tripActions.preparationActions ?? [];
      this.preparationActions.set(actions);
      
      // Initialize completed actions based on their status
      const completedSet = new Set<number>();
      actions.forEach((action, index) => {
        if (action.actionStatus) {
          completedSet.add(index);
        }
      });
      this.completedActions.set(completedSet);
    } catch (e) {
      console.error('Failed to parse trip actions JSON:', e);
      this.preparationActions.set([]);
    }
  }

  private loadExpiringDocuments(): void {
    this.loadingDocuments.set(true);
    this.myDocumentService.query().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        const documents = response.body ?? [];
        const now = dayjs();
        const sixMonthsFromNow = now.add(6, 'months');

        const expiring = documents.filter(doc => {
          const renewalDate = dayjs(doc.renewalDate);
          return renewalDate.isAfter(now) && renewalDate.isBefore(sixMonthsFromNow);
        });

        this.expiringDocuments.set(expiring);
        this.loadingDocuments.set(false);
      },
      error: () => {
        this.loadingDocuments.set(false);
      },
    });
  }

  private loadMonthlyExpenses(): void {
    this.loadingExpenses.set(true);
    this.subscriptionService.queryMy().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        const expenses = response.body ?? [];
        const now = dayjs();

        // Get all active subscriptions with upcoming due dates
        const upcomingExpenses = expenses
          .filter(expense => expense.dueDate && dayjs(expense.dueDate).isAfter(now))
          .sort((a, b) => {
            const dateA = dayjs(a.dueDate);
            const dateB = dayjs(b.dueDate);
            return dateA.diff(dateB);
          });

        this.monthlyExpenses.set(upcomingExpenses);
        this.loadingExpenses.set(false);
      },
      error: () => {
        this.loadingExpenses.set(false);
      },
    });
  }

  getDaysUntilDue(dueDate?: dayjs.Dayjs | null): number | null {
    if (!dueDate) return null;
    const now = dayjs();
    const due = dayjs(dueDate);
    const days = due.diff(now, 'day');
    return days >= 0 ? days : null;
  }

  viewTripDetails(): void {
    if (this.nearestTrip()?.id) {
      this.router.navigate(['/trips']);
    }
  }

  viewAllDocuments(): void {
    this.router.navigate(['/my-documents']);
  }

  viewAllExpenses(): void {
    this.router.navigate(['/expenses']);
  }

  viewMyObjectives(): void {
    this.router.navigate(['/goals']);
  }

  viewFamily(): void {
    this.router.navigate(['/family']);
  }

  goToLifeRadar(): void {
    this.router.navigate(['/life-radar']);
  }

  toggleStepCompletion(index: number): void {
    const completed = this.completedActions();
    if (completed.has(index)) {
      completed.delete(index);
    } else {
      completed.add(index);
    }
    this.completedActions.set(new Set(completed));
  }

  isStepCompleted(index: number): boolean {
    return this.completedActions().has(index);
  }

  createDecisionFromAction(action: PreparationAction, index: number): void {
    const decisionText = action.actionText;
    
    const modalRef = this.modalService.open(EvaluationDecisionCreateModalComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    
    modalRef.componentInstance.prefillDecision = decisionText;
    
    modalRef.result.then(
      (result) => {
        if (result) {
          // Mark action as completed after creating decision
          this.toggleStepCompletion(index);
          this.alertService.addAlert({
            type: 'success',
            message: 'Decision created successfully',
            translationKey: 'home.decisionCreatedSuccess',
          });
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }
}
