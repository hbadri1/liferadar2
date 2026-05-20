import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';
import SharedModule from 'app/shared/shared.module';
import { TripPlanStepService } from 'app/entities/trip-plan-step/service/trip-plan-step.service';
import { ITripPlanStep, NewTripPlanStep } from 'app/entities/trip-plan-step/trip-plan-step.model';
import { ITripPlan } from 'app/entities/trip-plan/trip-plan.model';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

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
  @Input() initialDate: dayjs.Dayjs | string | null = null;

  readonly timeOptions: string[] = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2)
      .toString()
      .padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
  });

  isSaving = signal(false);
  errorMsg = signal<string | null>(null);
  warningMsg = signal<string | null>(null);

  protected activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);
  private stepService = inject(TripPlanStepService);

  editForm = this.fb.group({
    actionName: ['', [Validators.required, Validators.maxLength(200)]],
    locationName: ['', [Validators.maxLength(255)]],
    startDate: ['', [Validators.required]],
    startTime: ['00:00', [Validators.required]],
    endDate: ['', [Validators.required]],
    endTime: ['00:30', [Validators.required]],
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
        startTime: this.step.startDate ? this.roundToHalfHourTime(this.step.startDate) : '00:00',
        endDate: this.step.endDate ? dayjs(this.step.endDate).format('YYYY-MM-DD') : '',
        endTime: this.step.endDate ? this.roundToHalfHourTime(this.step.endDate) : '00:30',
        notes: this.step.notes ?? '',
        latitude: this.step.latitude ?? null,
        longitude: this.step.longitude ?? null,
      });
    } else if (this.initialDate) {
      const parsedInitialDate = dayjs(this.initialDate);
      if (parsedInitialDate.isValid()) {
        const initialDay = parsedInitialDate.format('YYYY-MM-DD');
        this.editForm.patchValue({
          startDate: initialDay,
          endDate: initialDay,
        });
      }
    }

    ['startDate', 'startTime'].forEach(ctrl => {
      this.editForm.get(ctrl)?.valueChanges.subscribe(() => this.autoFillEndTime());
    });
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  save(): void {
    if (this.editForm.invalid) return;
    this.isSaving.set(true);
    this.errorMsg.set(null);
    this.warningMsg.set(null);

    const val = this.editForm.getRawValue();
    const startDate = dayjs(`${val.startDate!}T${val.startTime ?? '00:00'}`, DATE_TIME_FORMAT);
    const endDate = dayjs(`${val.endDate!}T${val.endTime ?? '00:30'}`, DATE_TIME_FORMAT);

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
        error: err => {
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
        error: err => {
          console.error('Error creating step:', err);
          this.isSaving.set(false);
          this.errorMsg.set('trips.errors.saveFailed');
        },
      });
    }
  }

  private autoFillEndTime(): void {
    const val = this.editForm.getRawValue();
    if (!val.startDate || !val.startTime) return;
    const endAlreadySet = val.endDate && (val.endDate !== val.startDate || val.endTime !== val.startTime);
    if (endAlreadySet) return;

    const start = dayjs(`${val.startDate}T${val.startTime}`);
    const end = start.add(30, 'minute');
    this.editForm.patchValue(
      {
        endDate: end.format('YYYY-MM-DD'),
        endTime: end.format('HH:mm') as '00:00' | '00:30',
      },
      { emitEvent: false },
    );
  }

  private roundToHalfHourTime(date: dayjs.Dayjs | string): string {
    const d = dayjs(date);
    const m = d.minute() < 30 ? '00' : '30';
    return `${d.format('HH')}:${m}`;
  }

  private validateStepDates(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs): boolean {
    this.errorMsg.set(null);
    this.warningMsg.set(null);

    if (startDate.isAfter(endDate)) {
      this.errorMsg.set('trips.errors.stepStartDateAfterEndDate');
      return false;
    }

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

      return !startDate.isAfter(existingEnd) && !existingStart.isAfter(endDate);
    });

    if (overlapsExistingStep) {
      this.warningMsg.set('trips.warnings.stepDatesOverlap');
    }

    return true;
  }
}
