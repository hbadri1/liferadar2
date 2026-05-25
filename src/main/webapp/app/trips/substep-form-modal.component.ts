import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';
import SharedModule from 'app/shared/shared.module';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ITripPlanStep, ITripPlanSubStep } from 'app/entities/trip-plan-step/trip-plan-step.model';
import { TripPlanStepService } from 'app/entities/trip-plan-step/service/trip-plan-step.service';

@Component({
  selector: 'jhi-substep-form-modal',
  templateUrl: './substep-form-modal.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
})
export class SubStepFormModalComponent implements OnInit {
  @Input() step!: ITripPlanStep;

  readonly timeOptions: string[] = Array.from({ length: 48 }, (_, i) => {
    const h = Math.floor(i / 2)
      .toString()
      .padStart(2, '0');
    const m = i % 2 === 0 ? '00' : '30';
    return `${h}:${m}`;
  });

  isSaving = signal(false);
  errorMsg = signal<string | null>(null);

  protected activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);
  private stepService = inject(TripPlanStepService);

  editForm = this.fb.group({
    actionName: ['', [Validators.required, Validators.maxLength(200)]],
    startDate: ['', [Validators.required]],
    startTime: ['00:00', [Validators.required]],
    endDate: ['', [Validators.required]],
    endTime: ['00:30', [Validators.required]],
    notes: ['', [Validators.maxLength(800)]],
  });

  ngOnInit(): void {
    const parentStart = dayjs(this.step.startDate);
    const parentEnd = dayjs(this.step.endDate);
    const initialEnd = parentStart.add(30, 'minute');

    this.editForm.patchValue({
      startDate: parentStart.format('YYYY-MM-DD'),
      startTime: parentStart.format('HH:mm'),
      endDate: (initialEnd.isAfter(parentEnd) ? parentEnd : initialEnd).format('YYYY-MM-DD'),
      endTime: (initialEnd.isAfter(parentEnd) ? parentEnd : initialEnd).format('HH:mm'),
    });
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  save(): void {
    if (this.editForm.invalid) {
      return;
    }

    this.errorMsg.set(null);
    this.isSaving.set(true);

    const val = this.editForm.getRawValue();
    const startDate = dayjs(`${val.startDate!}T${val.startTime ?? '00:00'}`, DATE_TIME_FORMAT);
    const endDate = dayjs(`${val.endDate!}T${val.endTime ?? '00:30'}`, DATE_TIME_FORMAT);

    if (startDate.isAfter(endDate)) {
      this.errorMsg.set('trips.errors.stepStartDateAfterEndDate');
      this.isSaving.set(false);
      return;
    }

    const parentStart = dayjs(this.step.startDate);
    const parentEnd = dayjs(this.step.endDate);
    if (startDate.isBefore(parentStart) || endDate.isAfter(parentEnd)) {
      this.errorMsg.set('trips.errors.subStepOutsideStepRange');
      this.isSaving.set(false);
      return;
    }

    const currentSubSteps = this.step.subSteps ?? [];
    const maxSequence = currentSubSteps.length > 0 ? Math.max(...currentSubSteps.map(s => s.sequence ?? 0)) : 0;

    const subStep: ITripPlanSubStep = {
      id: null,
      actionName: val.actionName?.trim() ?? '',
      startDate,
      endDate,
      notes: val.notes ?? null,
      sequence: maxSequence + 1,
    };

    const updatedStep: ITripPlanStep = {
      ...this.step,
      subSteps: [...currentSubSteps, subStep],
    };

    this.stepService.update(updatedStep).subscribe({
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

