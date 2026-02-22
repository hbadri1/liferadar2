import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ILifePillarTranslation, NewLifePillarTranslation } from '../life-pillar-translation.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ILifePillarTranslation for edit and NewLifePillarTranslationFormGroupInput for create.
 */
type LifePillarTranslationFormGroupInput = ILifePillarTranslation | PartialWithRequiredKeyOf<NewLifePillarTranslation>;

type LifePillarTranslationFormDefaults = Pick<NewLifePillarTranslation, 'id'>;

type LifePillarTranslationFormGroupContent = {
  id: FormControl<ILifePillarTranslation['id'] | NewLifePillarTranslation['id']>;
  lang: FormControl<ILifePillarTranslation['lang']>;
  name: FormControl<ILifePillarTranslation['name']>;
  description: FormControl<ILifePillarTranslation['description']>;
  lifePillar: FormControl<ILifePillarTranslation['lifePillar']>;
};

export type LifePillarTranslationFormGroup = FormGroup<LifePillarTranslationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class LifePillarTranslationFormService {
  createLifePillarTranslationFormGroup(
    lifePillarTranslation: LifePillarTranslationFormGroupInput = { id: null },
  ): LifePillarTranslationFormGroup {
    const lifePillarTranslationRawValue = {
      ...this.getFormDefaults(),
      ...lifePillarTranslation,
    };
    return new FormGroup<LifePillarTranslationFormGroupContent>({
      id: new FormControl(
        { value: lifePillarTranslationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      lang: new FormControl(lifePillarTranslationRawValue.lang, {
        validators: [Validators.required],
      }),
      name: new FormControl(lifePillarTranslationRawValue.name, {
        validators: [Validators.required, Validators.maxLength(120)],
      }),
      description: new FormControl(lifePillarTranslationRawValue.description, {
        validators: [Validators.maxLength(500)],
      }),
      lifePillar: new FormControl(lifePillarTranslationRawValue.lifePillar, {
        validators: [Validators.required],
      }),
    });
  }

  getLifePillarTranslation(form: LifePillarTranslationFormGroup): ILifePillarTranslation | NewLifePillarTranslation {
    return form.getRawValue() as ILifePillarTranslation | NewLifePillarTranslation;
  }

  resetForm(form: LifePillarTranslationFormGroup, lifePillarTranslation: LifePillarTranslationFormGroupInput): void {
    const lifePillarTranslationRawValue = { ...this.getFormDefaults(), ...lifePillarTranslation };
    form.reset(
      {
        ...lifePillarTranslationRawValue,
        id: { value: lifePillarTranslationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): LifePillarTranslationFormDefaults {
    return {
      id: null,
    };
  }
}
