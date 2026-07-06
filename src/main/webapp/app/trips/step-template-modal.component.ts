import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs/esm';

import SharedModule from 'app/shared/shared.module';
import { ITripPlan } from 'app/entities/trip-plan/trip-plan.model';

export type StepTemplateKey = 'airportFlight';

export interface IStepTemplateSelection {
  templateKey: StepTemplateKey;
  flightDateTime: string;
}

@Component({
  selector: 'jhi-step-template-modal',
  templateUrl: './step-template-modal.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
})
export class StepTemplateModalComponent implements OnInit {
  @Input() trip: ITripPlan | null = null;

  errorMsg = signal<string | null>(null);

  protected activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    templateKey: this.fb.nonNullable.control<StepTemplateKey>('airportFlight', { validators: [Validators.required] }),
    flightDateTime: this.fb.nonNullable.control('', { validators: [Validators.required] }),
  });

  ngOnInit(): void {
    const tripStart = this.trip?.startDate ? dayjs(this.trip.startDate) : null;
    const fallback = tripStart?.isValid() ? tripStart.add(3, 'hour') : dayjs().add(1, 'day').hour(12).minute(0);
    this.form.controls.flightDateTime.setValue(fallback.format('YYYY-MM-DDTHH:mm'));
  }

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  selectTemplate(templateKey: StepTemplateKey): void {
    this.form.controls.templateKey.setValue(templateKey);
  }

  get selectedTemplate(): StepTemplateKey {
    return this.form.controls.templateKey.value;
  }

  get flightWindowStartLabel(): string {
    const flightDateTime = dayjs(this.form.controls.flightDateTime.value);
    if (!flightDateTime.isValid()) {
      return '--';
    }
    return flightDateTime.subtract(3, 'hour').format('DD MMM YYYY HH:mm');
  }

  get flightWindowEndLabel(): string {
    const flightDateTime = dayjs(this.form.controls.flightDateTime.value);
    if (!flightDateTime.isValid()) {
      return '--';
    }
    return flightDateTime.format('DD MMM YYYY HH:mm');
  }

  save(): void {
    this.errorMsg.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { templateKey, flightDateTime } = this.form.getRawValue();
    if (!dayjs(flightDateTime).isValid()) {
      this.errorMsg.set('trips.errors.templateInvalidFlightTime');
      return;
    }

    this.activeModal.close({ templateKey, flightDateTime } as IStepTemplateSelection);
  }
}

