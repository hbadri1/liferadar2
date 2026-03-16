import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ISubPillarTranslation, NewSubPillarTranslation } from '../sub-pillar-translation.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISubPillarTranslation for edit and NewSubPillarTranslationFormGroupInput for create.
 */
type SubPillarTranslationFormGroupInput = ISubPillarTranslation | PartialWithRequiredKeyOf<NewSubPillarTranslation>;

type SubPillarTranslationFormDefaults = Pick<NewSubPillarTranslation, 'id'>;

type SubPillarTranslationFormGroupContent = {
  id: FormControl<ISubPillarTranslation['id'] | NewSubPillarTranslation['id']>;
  lang: FormControl<ISubPillarTranslation['lang']>;
  name: FormControl<ISubPillarTranslation['name']>;
  description: FormControl<ISubPillarTranslation['description']>;
  subPillar: FormControl<ISubPillarTranslation['subPillar']>;
};

export type SubPillarTranslationFormGroup = FormGroup<SubPillarTranslationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SubPillarTranslationFormService {
  createSubPillarTranslationFormGroup(
    subPillarTranslation: SubPillarTranslationFormGroupInput = { id: null },
  ): SubPillarTranslationFormGroup {
    const subPillarTranslationRawValue = {
      ...this.getFormDefaults(),
      ...subPillarTranslation,
    };
    return new FormGroup<SubPillarTranslationFormGroupContent>({
      id: new FormControl(
        { value: subPillarTranslationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      lang: new FormControl(subPillarTranslationRawValue.lang, {
        validators: [Validators.required],
      }),
      name: new FormControl(subPillarTranslationRawValue.name, {
        validators: [Validators.required, Validators.maxLength(120)],
      }),
      description: new FormControl(subPillarTranslationRawValue.description, {
        validators: [Validators.maxLength(500)],
      }),
      subPillar: new FormControl(subPillarTranslationRawValue.subPillar, {
        validators: [Validators.required],
      }),
    });
  }

  getSubPillarTranslation(form: SubPillarTranslationFormGroup): ISubPillarTranslation | NewSubPillarTranslation {
    return form.getRawValue() as ISubPillarTranslation | NewSubPillarTranslation;
  }

  resetForm(form: SubPillarTranslationFormGroup, subPillarTranslation: SubPillarTranslationFormGroupInput): void {
    const subPillarTranslationRawValue = { ...this.getFormDefaults(), ...subPillarTranslation };
    form.reset(
      {
        ...subPillarTranslationRawValue,
        id: { value: subPillarTranslationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): SubPillarTranslationFormDefaults {
    return {
      id: null,
    };
  }
}
