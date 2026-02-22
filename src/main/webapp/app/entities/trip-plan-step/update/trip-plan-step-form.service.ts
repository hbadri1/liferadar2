import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ITripPlanStep, NewTripPlanStep } from '../trip-plan-step.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITripPlanStep for edit and NewTripPlanStepFormGroupInput for create.
 */
type TripPlanStepFormGroupInput = ITripPlanStep | PartialWithRequiredKeyOf<NewTripPlanStep>;

type TripPlanStepFormDefaults = Pick<NewTripPlanStep, 'id'>;

type TripPlanStepFormGroupContent = {
  id: FormControl<ITripPlanStep['id'] | NewTripPlanStep['id']>;
  startDate: FormControl<ITripPlanStep['startDate']>;
  endDate: FormControl<ITripPlanStep['endDate']>;
  actionName: FormControl<ITripPlanStep['actionName']>;
  sequence: FormControl<ITripPlanStep['sequence']>;
  notes: FormControl<ITripPlanStep['notes']>;
  tripPlan: FormControl<ITripPlanStep['tripPlan']>;
};

export type TripPlanStepFormGroup = FormGroup<TripPlanStepFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TripPlanStepFormService {
  createTripPlanStepFormGroup(tripPlanStep: TripPlanStepFormGroupInput = { id: null }): TripPlanStepFormGroup {
    const tripPlanStepRawValue = {
      ...this.getFormDefaults(),
      ...tripPlanStep,
    };
    return new FormGroup<TripPlanStepFormGroupContent>({
      id: new FormControl(
        { value: tripPlanStepRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      startDate: new FormControl(tripPlanStepRawValue.startDate, {
        validators: [Validators.required],
      }),
      endDate: new FormControl(tripPlanStepRawValue.endDate, {
        validators: [Validators.required],
      }),
      actionName: new FormControl(tripPlanStepRawValue.actionName, {
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      sequence: new FormControl(tripPlanStepRawValue.sequence, {
        validators: [Validators.required, Validators.min(1)],
      }),
      notes: new FormControl(tripPlanStepRawValue.notes, {
        validators: [Validators.maxLength(800)],
      }),
      tripPlan: new FormControl(tripPlanStepRawValue.tripPlan, {
        validators: [Validators.required],
      }),
    });
  }

  getTripPlanStep(form: TripPlanStepFormGroup): ITripPlanStep | NewTripPlanStep {
    return form.getRawValue() as ITripPlanStep | NewTripPlanStep;
  }

  resetForm(form: TripPlanStepFormGroup, tripPlanStep: TripPlanStepFormGroupInput): void {
    const tripPlanStepRawValue = { ...this.getFormDefaults(), ...tripPlanStep };
    form.reset(
      {
        ...tripPlanStepRawValue,
        id: { value: tripPlanStepRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TripPlanStepFormDefaults {
    return {
      id: null,
    };
  }
}
