import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';
import SharedModule from 'app/shared/shared.module';
import { TripPlanStepService } from 'app/entities/trip-plan-step/service/trip-plan-step.service';
import { ITripPlanStep, NewTripPlanStep } from 'app/entities/trip-plan-step/trip-plan-step.model';
import { ITripPlan } from 'app/entities/trip-plan/trip-plan.model';

@Component({
  selector: 'jhi-step-form-modal',
  templateUrl: './step-form-modal.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
})
export class StepFormModalComponent implements OnInit {
  @Input() step: ITripPlanStep | null = null;
  @Input() trip!: ITripPlan;
  @Input() nextSequence = 1;
  @Input() existingSteps: ITripPlanStep[] = [];

  isSaving = signal(false);
  errorMsg = signal<string | null>(null);

  protected activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);
  private stepService = inject(TripPlanStepService);

  editForm = this.fb.group({
    actionName: ['', [Validators.required, Validators.maxLength(200)]],
    locationName: ['', [Validators.maxLength(255)]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
    notes: ['', [Validators.maxLength(800)]],
    latitude: [null as number | null],
    longitude: [null as number | null],
  });

  get isEdit(): boolean {
    return this.step !== null;
  }

  ngOnInit(): void {
    if (this.step) {
      this.editForm.patchValue({
        actionName: this.step.actionName ?? '',
        locationName: this.step.locationName ?? '',
        startDate: this.step.startDate ? dayjs(this.step.startDate).format('YYYY-MM-DD') : '',
        endDate: this.step.endDate ? dayjs(this.step.endDate).format('YYYY-MM-DD') : '',
        notes: this.step.notes ?? '',
        latitude: this.step.latitude ?? null,
        longitude: this.step.longitude ?? null,
      });
    }
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  save(): void {
    if (this.editForm.invalid) return;
    this.isSaving.set(true);
    this.errorMsg.set(null);

    const val = this.editForm.getRawValue();
    const startDate = dayjs(val.startDate!);
    const endDate = dayjs(val.endDate!);

    // Validate step dates
    if (!this.validateStepDates(startDate, endDate)) {
      this.isSaving.set(false);
      return;
    }

    if (this.step) {
      const updated: ITripPlanStep = {
        ...this.step,
        actionName: val.actionName!,
        locationName: val.locationName ?? null,
        startDate,
        endDate,
        notes: val.notes ?? null,
        latitude: val.latitude ?? null,
        longitude: val.longitude ?? null,
      };
      this.stepService.update(updated).subscribe({
        next: res => {
          this.isSaving.set(false);
          this.activeModal.close(res.body);
        },
        error: (err) => {
          console.error('Error updating step:', err);
          this.isSaving.set(false);
          this.errorMsg.set('trips.errors.saveFailed');
        },
      });
    } else {
      const newStep: NewTripPlanStep = {
        id: null,
        actionName: val.actionName!,
        locationName: val.locationName ?? null,
        startDate,
        endDate,
        notes: val.notes ?? null,
        latitude: val.latitude ?? null,
        longitude: val.longitude ?? null,
        sequence: this.nextSequence,
        tripPlan: { id: this.trip.id } as ITripPlan,
      };
      this.stepService.create(newStep).subscribe({
        next: res => {
          this.isSaving.set(false);
          this.activeModal.close(res.body);
        },
        error: (err) => {
          console.error('Error creating step:', err);
          this.isSaving.set(false);
          this.errorMsg.set('trips.errors.saveFailed');
        },
      });
    }
  }

  private validateStepDates(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs): boolean {
    // Check if startDate is after endDate
    if (startDate.isAfter(endDate)) {
      this.errorMsg.set('trips.errors.stepStartDateAfterEndDate');
      return false;
    }

    // Check if step dates are within trip date range
    const tripStart = dayjs(this.trip.startDate);
    const tripEnd = dayjs(this.trip.endDate);

    if (startDate.isBefore(tripStart)) {
      this.errorMsg.set('trips.errors.stepStartDateBeforeTripStart');
      return false;
    }

    if (endDate.isAfter(tripEnd)) {
      this.errorMsg.set('trips.errors.stepEndDateAfterTripEnd');
      return false;
    }

    const overlapsExistingStep = this.existingSteps.some(existingStep => {
      if (this.step?.id != null && existingStep.id === this.step.id) {
        return false;
      }

      const existingStart = dayjs(existingStep.startDate);
      const existingEnd = dayjs(existingStep.endDate);

      return !startDate.isAfter(existingEnd, 'day') && !existingStart.isAfter(endDate, 'day');
    });

    if (overlapsExistingStep) {
      this.errorMsg.set('trips.errors.stepDatesOverlap');
      return false;
    }

    return true;
  }
}

