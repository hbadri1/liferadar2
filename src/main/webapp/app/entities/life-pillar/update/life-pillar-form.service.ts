import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ILifePillar, NewLifePillar } from '../life-pillar.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ILifePillar for edit and NewLifePillarFormGroupInput for create.
 */
type LifePillarFormGroupInput = ILifePillar | PartialWithRequiredKeyOf<NewLifePillar>;

type LifePillarFormDefaults = Pick<NewLifePillar, 'id' | 'isActive'>;

type LifePillarFormGroupContent = {
  id: FormControl<ILifePillar['id'] | NewLifePillar['id']>;
  code: FormControl<ILifePillar['code']>;
  isActive: FormControl<ILifePillar['isActive']>;
  owner: FormControl<ILifePillar['owner']>;
};

export type LifePillarFormGroup = FormGroup<LifePillarFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class LifePillarFormService {
  createLifePillarFormGroup(lifePillar: LifePillarFormGroupInput = { id: null }): LifePillarFormGroup {
    const lifePillarRawValue = {
      ...this.getFormDefaults(),
      ...lifePillar,
    };
    return new FormGroup<LifePillarFormGroupContent>({
      id: new FormControl(
        { value: lifePillarRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(lifePillarRawValue.code, {
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      isActive: new FormControl(lifePillarRawValue.isActive, {
        validators: [Validators.required],
      }),
      owner: new FormControl(lifePillarRawValue.owner, {
        validators: [Validators.required],
      }),
    });
  }

  getLifePillar(form: LifePillarFormGroup): ILifePillar | NewLifePillar {
    return form.getRawValue() as ILifePillar | NewLifePillar;
  }

  resetForm(form: LifePillarFormGroup, lifePillar: LifePillarFormGroupInput): void {
    const lifePillarRawValue = { ...this.getFormDefaults(), ...lifePillar };
    form.reset(
      {
        ...lifePillarRawValue,
        id: { value: lifePillarRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): LifePillarFormDefaults {
    return {
      id: null,
      isActive: false,
    };
  }
}
