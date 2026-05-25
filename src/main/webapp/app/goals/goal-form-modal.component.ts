import { Component, Input, OnInit, inject, computed } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { GoalService } from './goal.service';
import {
  IGoal, GoalType, GoalCategory, GoalStatus, GoalPriority,
  GoalVisibility, GoalProgressMode, GoalReviewFrequency
} from './goal.model';

@Component({
  selector: 'jhi-goal-form-modal',
  templateUrl: './goal-form-modal.component.html',
  imports: [SharedModule, FormsModule],
})
export class GoalFormModalComponent implements OnInit {
  @Input() goal: IGoal | null = null;

  activeModal = inject(NgbActiveModal);
  private goalService = inject(GoalService);
  private accountService = inject(AccountService);

  isSaving = false;
  errorMsg: string | null = null;

  /** True if the current user has ROLE_CHILD. Children can only create FAMILY_SHARED goals. */
  isChild = computed(() => {
    const authorities = (this.accountService.trackCurrentAccount()()?.authorities ?? [])
      .map(a => (a ?? '').toString().trim().toUpperCase());
    return authorities.includes('ROLE_CHILD') || authorities.includes('CHILD');
  });

  form = {
    title: '',
    description: '',
    goalType: 'PERSONAL' as GoalType,
    category: null as GoalCategory | null,
    status: 'DRAFT' as GoalStatus,
    priority: 'MEDIUM' as GoalPriority,
    visibility: 'PRIVATE' as GoalVisibility,
    startDate: '',
    targetDate: '',
    progressMode: 'MANUAL_PERCENTAGE' as GoalProgressMode,
    progressPercentage: 0,
    targetValue: null as number | null,
    currentValue: null as number | null,
    baselineValue: null as number | null,
    unit: '',
    confidenceLevel: null as GoalPriority | null,
    difficultyLevel: null as GoalPriority | null,
    motivation: '',
    successCriteria: '',
    riskNotes: '',
    blockerNotes: '',
    reviewFrequency: null as GoalReviewFrequency | null,
    pillarId: null as number | null,
  };

  goalTypes: GoalType[] = ['PERSONAL','FAMILY','CAREER','HEALTH','FINANCIAL','SPIRITUAL','LEARNING','RELATIONSHIP','TRAVEL','PROJECT','CUSTOM'];
  goalCategories: GoalCategory[] = ['LIFE_IMPROVEMENT','PROJECT_DELIVERY','SKILL_BUILDING','HABIT_BASED','FINANCIAL_TARGET','HEALTH_TARGET','RELATIONSHIP_TARGET','SPIRITUAL_TARGET','EVENT_PREPARATION','OTHER'];
  goalStatuses: GoalStatus[] = ['DRAFT','NOT_STARTED','IN_PROGRESS','ON_HOLD','BLOCKED','AT_RISK','COMPLETED','CANCELLED'];
  priorities: GoalPriority[] = ['LOW','MEDIUM','HIGH','CRITICAL'];
  visibilities: GoalVisibility[] = ['PRIVATE','FAMILY_SHARED'];
  progressModes: GoalProgressMode[] = ['MANUAL_PERCENTAGE','NUMERIC_TARGET','MILESTONE_BASED','ACTION_ITEM_BASED','HYBRID'];
  reviewFrequencies: GoalReviewFrequency[] = ['DAILY','WEEKLY','BI_WEEKLY','MONTHLY','QUARTERLY','CUSTOM','NONE'];

  get isNumericMode(): boolean {
    return this.form.progressMode === 'NUMERIC_TARGET';
  }

  get isManualMode(): boolean {
    return this.form.progressMode === 'MANUAL_PERCENTAGE' || this.form.progressMode === 'HYBRID';
  }

  ngOnInit(): void {
    if (this.goal) {
      this.form.title = this.goal.title ?? '';
      this.form.description = this.goal.description ?? '';
      this.form.goalType = this.goal.goalType ?? 'PERSONAL';
      this.form.category = this.goal.category ?? null;
      this.form.status = this.goal.status ?? 'DRAFT';
      this.form.priority = this.goal.priority ?? 'MEDIUM';
      this.form.visibility = this.goal.visibility ?? 'PRIVATE';
      this.form.startDate = this.goal.startDate ?? '';
      this.form.targetDate = this.goal.targetDate ?? '';
      this.form.progressMode = this.goal.progressMode ?? 'MANUAL_PERCENTAGE';
      this.form.progressPercentage = this.goal.progressPercentage ?? 0;
      this.form.targetValue = this.goal.targetValue ?? null;
      this.form.currentValue = this.goal.currentValue ?? null;
      this.form.baselineValue = this.goal.baselineValue ?? null;
      this.form.unit = this.goal.unit ?? '';
      this.form.confidenceLevel = this.goal.confidenceLevel ?? null;
      this.form.difficultyLevel = this.goal.difficultyLevel ?? null;
      this.form.motivation = this.goal.motivation ?? '';
      this.form.successCriteria = this.goal.successCriteria ?? '';
      this.form.riskNotes = this.goal.riskNotes ?? '';
      this.form.blockerNotes = this.goal.blockerNotes ?? '';
      this.form.reviewFrequency = this.goal.reviewFrequency ?? null;
      this.form.pillarId = this.goal.pillar?.id ?? null;
    }

    // Children can only create FAMILY_SHARED goals
    if (this.isChild()) {
      this.form.visibility = 'FAMILY_SHARED';
    }
  }

  save(): void {
    if (!this.form.title?.trim()) {
      this.errorMsg = 'goals.validation.titleRequired';
      return;
    }
    this.isSaving = true;
    this.errorMsg = null;

    const payload = {
      ...this.form,
      startDate: this.form.startDate || null,
      targetDate: this.form.targetDate || null,
    };

    const obs = this.goal?.id
      ? this.goalService.updateGoal(this.goal.id, payload)
      : this.goalService.createGoal(payload);

    obs.subscribe({
      next: result => {
        this.isSaving = false;
        this.activeModal.close(result);
      },
      error: () => {
        this.isSaving = false;
        this.errorMsg = 'goals.errors.saveFailed';
      },
    });
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }
}

