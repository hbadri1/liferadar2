import { Component, Input, OnInit, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';
import { GoalService } from './goal.service';
import { IGoal, GoalStatus, GoalPriority } from './goal.model';

@Component({
  selector: 'jhi-goal-review-modal',
  templateUrl: './goal-review-modal.component.html',
  imports: [SharedModule, FormsModule],
})
export class GoalReviewModalComponent implements OnInit {
  @Input() goal!: IGoal;

  activeModal = inject(NgbActiveModal);
  private goalService = inject(GoalService);

  isSaving = false;
  errorMsg: string | null = null;

  today = new Date().toISOString().split('T')[0];

  form = {
    updateDate: this.today,
    summary: '',
    progressPercentage: null as number | null,
    currentValue: null as number | null,
    confidenceLevel: null as GoalPriority | null,
    status: null as GoalStatus | null,
    mood: '',
    blockers: '',
    nextStep: '',
  };

  statuses: GoalStatus[] = ['IN_PROGRESS','ON_HOLD','BLOCKED','AT_RISK','COMPLETED','CANCELLED'];
  priorities: GoalPriority[] = ['LOW','MEDIUM','HIGH','CRITICAL'];

  ngOnInit(): void {
    this.form.progressPercentage = this.goal.progressPercentage ?? null;
    this.form.currentValue = this.goal.currentValue ?? null;
    this.form.status = this.goal.status ?? null;
    this.form.confidenceLevel = this.goal.confidenceLevel ?? null;
  }

  save(): void {
    this.isSaving = true;
    this.errorMsg = null;
    this.goalService.createGoalUpdate(this.goal.id, {
      ...this.form,
      updateDate: this.form.updateDate,
    }).subscribe({
      next: () => {
        this.isSaving = false;
        // reload goal
        this.goalService.getGoal(this.goal.id).subscribe({
          next: updated => this.activeModal.close(updated),
          error: () => this.activeModal.close(true),
        });
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

