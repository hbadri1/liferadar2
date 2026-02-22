import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ISubLifePillarTranslation, NewSubLifePillarTranslation } from '../sub-life-pillar-translation.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISubLifePillarTranslation for edit and NewSubLifePillarTranslationFormGroupInput for create.
 */
type SubLifePillarTranslationFormGroupInput = ISubLifePillarTranslation | PartialWithRequiredKeyOf<NewSubLifePillarTranslation>;

type SubLifePillarTranslationFormDefaults = Pick<NewSubLifePillarTranslation, 'id'>;

type SubLifePillarTranslationFormGroupContent = {
  id: FormControl<ISubLifePillarTranslation['id'] | NewSubLifePillarTranslation['id']>;
  lang: FormControl<ISubLifePillarTranslation['lang']>;
  name: FormControl<ISubLifePillarTranslation['name']>;
  description: FormControl<ISubLifePillarTranslation['description']>;
  subLifePillar: FormControl<ISubLifePillarTranslation['subLifePillar']>;
};

export type SubLifePillarTranslationFormGroup = FormGroup<SubLifePillarTranslationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SubLifePillarTranslationFormService {
  createSubLifePillarTranslationFormGroup(
    subLifePillarTranslation: SubLifePillarTranslationFormGroupInput = { id: null },
  ): SubLifePillarTranslationFormGroup {
    const subLifePillarTranslationRawValue = {
      ...this.getFormDefaults(),
      ...subLifePillarTranslation,
    };
    return new FormGroup<SubLifePillarTranslationFormGroupContent>({
      id: new FormControl(
        { value: subLifePillarTranslationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      lang: new FormControl(subLifePillarTranslationRawValue.lang, {
        validators: [Validators.required],
      }),
      name: new FormControl(subLifePillarTranslationRawValue.name, {
        validators: [Validators.required, Validators.maxLength(120)],
      }),
      description: new FormControl(subLifePillarTranslationRawValue.description, {
        validators: [Validators.maxLength(500)],
      }),
      subLifePillar: new FormControl(subLifePillarTranslationRawValue.subLifePillar, {
        validators: [Validators.required],
      }),
    });
  }

  getSubLifePillarTranslation(form: SubLifePillarTranslationFormGroup): ISubLifePillarTranslation | NewSubLifePillarTranslation {
    return form.getRawValue() as ISubLifePillarTranslation | NewSubLifePillarTranslation;
  }

  resetForm(form: SubLifePillarTranslationFormGroup, subLifePillarTranslation: SubLifePillarTranslationFormGroupInput): void {
    const subLifePillarTranslationRawValue = { ...this.getFormDefaults(), ...subLifePillarTranslation };
    form.reset(
      {
        ...subLifePillarTranslationRawValue,
        id: { value: subLifePillarTranslationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): SubLifePillarTranslationFormDefaults {
    return {
      id: null,
    };
  }
}
