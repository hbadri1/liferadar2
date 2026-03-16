import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IPillarTranslation, NewPillarTranslation } from '../pillar-translation.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPillarTranslation for edit and NewPillarTranslationFormGroupInput for create.
 */
type PillarTranslationFormGroupInput = IPillarTranslation | PartialWithRequiredKeyOf<NewPillarTranslation>;

type PillarTranslationFormDefaults = Pick<NewPillarTranslation, 'id'>;

type PillarTranslationFormGroupContent = {
  id: FormControl<IPillarTranslation['id'] | NewPillarTranslation['id']>;
  lang: FormControl<IPillarTranslation['lang']>;
  name: FormControl<IPillarTranslation['name']>;
  description: FormControl<IPillarTranslation['description']>;
  pillar: FormControl<IPillarTranslation['pillar']>;
};

export type PillarTranslationFormGroup = FormGroup<PillarTranslationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PillarTranslationFormService {
  createPillarTranslationFormGroup(
    pillarTranslation: PillarTranslationFormGroupInput = { id: null },
  ): PillarTranslationFormGroup {
    const pillarTranslationRawValue = {
      ...this.getFormDefaults(),
      ...pillarTranslation,
    };
    return new FormGroup<PillarTranslationFormGroupContent>({
      id: new FormControl(
        { value: pillarTranslationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      lang: new FormControl(pillarTranslationRawValue.lang, {
        validators: [Validators.required],
      }),
      name: new FormControl(pillarTranslationRawValue.name, {
        validators: [Validators.required, Validators.maxLength(120)],
      }),
      description: new FormControl(pillarTranslationRawValue.description, {
        validators: [Validators.maxLength(500)],
      }),
      pillar: new FormControl(pillarTranslationRawValue.pillar, {
        validators: [Validators.required],
      }),
    });
  }

  getPillarTranslation(form: PillarTranslationFormGroup): IPillarTranslation | NewPillarTranslation {
    return form.getRawValue() as IPillarTranslation | NewPillarTranslation;
  }

  resetForm(form: PillarTranslationFormGroup, pillarTranslation: PillarTranslationFormGroupInput): void {
    const pillarTranslationRawValue = { ...this.getFormDefaults(), ...pillarTranslation };
    form.reset(
      {
        ...pillarTranslationRawValue,
        id: { value: pillarTranslationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): PillarTranslationFormDefaults {
    return {
      id: null,
    };
  }
}
