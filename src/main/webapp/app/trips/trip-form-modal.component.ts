import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';
import SharedModule from 'app/shared/shared.module';
import { TripPlanService } from 'app/entities/trip-plan/service/trip-plan.service';
import { ITripPlan, NewTripPlan } from 'app/entities/trip-plan/trip-plan.model';

@Component({
  selector: 'jhi-trip-form-modal',
  templateUrl: './trip-form-modal.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
})
export class TripFormModalComponent implements OnInit {
  @Input() trip: ITripPlan | null = null;

  isSaving = signal(false);
  errorMsg = signal<string | null>(null);

  protected activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);
  private tripPlanService = inject(TripPlanService);

  editForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    description: ['', [Validators.maxLength(800)]],
    startDate: ['', [Validators.required]],
    endDate: ['', [Validators.required]],
  });

  get isEdit(): boolean {
    return this.trip !== null;
  }

  ngOnInit(): void {
    if (this.trip) {
      this.editForm.patchValue({
        title: this.trip.title ?? '',
        description: this.trip.description ?? '',
        startDate: this.trip.startDate ? dayjs(this.trip.startDate).format('YYYY-MM-DD') : '',
        endDate: this.trip.endDate ? dayjs(this.trip.endDate).format('YYYY-MM-DD') : '',
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

    // Validate trip dates
    if (!this.validateTripDates(startDate, endDate)) {
      this.isSaving.set(false);
      return;
    }

    if (this.trip) {
      const updated: ITripPlan = {
        ...this.trip,
        title: val.title!,
        description: val.description ?? null,
        startDate,
        endDate,
      };
      this.tripPlanService.update(updated).subscribe({
        next: res => {
          this.isSaving.set(false);
          this.activeModal.close(res.body);
        },
        error: () => {
          this.isSaving.set(false);
          this.errorMsg.set('trips.errors.saveFailed');
        },
      });
    } else {
      const newTrip: NewTripPlan = {
        id: null,
        title: val.title!,
        description: val.description ?? null,
        startDate,
        endDate,
        isActive: true,
      };
      this.tripPlanService.create(newTrip).subscribe({
        next: res => {
          this.isSaving.set(false);
          this.activeModal.close(res.body);
        },
        error: () => {
          this.isSaving.set(false);
          this.errorMsg.set('trips.errors.saveFailed');
        },
      });
    }
  }

  private validateTripDates(startDate: dayjs.Dayjs, endDate: dayjs.Dayjs): boolean {
    const today = dayjs();

    // Check if startDate is in the past
    if (startDate.isBefore(today, 'day')) {
      this.errorMsg.set('trips.errors.startDateInPast');
      return false;
    }

    // Check if endDate is in the past
    if (endDate.isBefore(today, 'day')) {
      this.errorMsg.set('trips.errors.endDateInPast');
      return false;
    }

    // Check if startDate is after endDate
    if (startDate.isAfter(endDate)) {
      this.errorMsg.set('trips.errors.startDateAfterEndDate');
      return false;
    }

    return true;
  }
}

