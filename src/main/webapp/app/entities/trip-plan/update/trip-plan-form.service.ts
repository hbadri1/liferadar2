import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ITripPlan, NewTripPlan } from '../trip-plan.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITripPlan for edit and NewTripPlanFormGroupInput for create.
 */
type TripPlanFormGroupInput = ITripPlan | PartialWithRequiredKeyOf<NewTripPlan>;

type TripPlanFormDefaults = Pick<NewTripPlan, 'id'>;

type TripPlanFormGroupContent = {
  id: FormControl<ITripPlan['id'] | NewTripPlan['id']>;
  title: FormControl<ITripPlan['title']>;
  description: FormControl<ITripPlan['description']>;
  startDate: FormControl<ITripPlan['startDate']>;
  endDate: FormControl<ITripPlan['endDate']>;
  owner: FormControl<ITripPlan['owner']>;
};

export type TripPlanFormGroup = FormGroup<TripPlanFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TripPlanFormService {
  createTripPlanFormGroup(tripPlan: TripPlanFormGroupInput = { id: null }): TripPlanFormGroup {
    const tripPlanRawValue = {
      ...this.getFormDefaults(),
      ...tripPlan,
    };
    return new FormGroup<TripPlanFormGroupContent>({
      id: new FormControl(
        { value: tripPlanRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      title: new FormControl(tripPlanRawValue.title, {
        validators: [Validators.required, Validators.maxLength(160)],
      }),
      description: new FormControl(tripPlanRawValue.description, {
        validators: [Validators.maxLength(800)],
      }),
      startDate: new FormControl(tripPlanRawValue.startDate, {
        validators: [Validators.required],
      }),
      endDate: new FormControl(tripPlanRawValue.endDate, {
        validators: [Validators.required],
      }),
      owner: new FormControl(tripPlanRawValue.owner, {
        validators: [Validators.required],
      }),
    });
  }

  getTripPlan(form: TripPlanFormGroup): ITripPlan | NewTripPlan {
    return form.getRawValue() as ITripPlan | NewTripPlan;
  }

  resetForm(form: TripPlanFormGroup, tripPlan: TripPlanFormGroupInput): void {
    const tripPlanRawValue = { ...this.getFormDefaults(), ...tripPlan };
    form.reset(
      {
        ...tripPlanRawValue,
        id: { value: tripPlanRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): TripPlanFormDefaults {
    return {
      id: null,
    };
  }
}
