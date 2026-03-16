import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ISubPillarItemTranslation, NewSubPillarItemTranslation } from '../sub-pillar-item-translation.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISubPillarItemTranslation for edit and NewSubPillarItemTranslationFormGroupInput for create.
 */
type SubPillarItemTranslationFormGroupInput = ISubPillarItemTranslation | PartialWithRequiredKeyOf<NewSubPillarItemTranslation>;

type SubPillarItemTranslationFormDefaults = Pick<NewSubPillarItemTranslation, 'id'>;

type SubPillarItemTranslationFormGroupContent = {
  id: FormControl<ISubPillarItemTranslation['id'] | NewSubPillarItemTranslation['id']>;
  lang: FormControl<ISubPillarItemTranslation['lang']>;
  name: FormControl<ISubPillarItemTranslation['name']>;
  description: FormControl<ISubPillarItemTranslation['description']>;
  subPillarItem: FormControl<ISubPillarItemTranslation['subPillarItem']>;
};

export type SubPillarItemTranslationFormGroup = FormGroup<SubPillarItemTranslationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SubPillarItemTranslationFormService {
  createSubPillarItemTranslationFormGroup(
    subPillarItemTranslation: SubPillarItemTranslationFormGroupInput = { id: null },
  ): SubPillarItemTranslationFormGroup {
    const subPillarItemTranslationRawValue = {
      ...this.getFormDefaults(),
      ...subPillarItemTranslation,
    };
    return new FormGroup<SubPillarItemTranslationFormGroupContent>({
      id: new FormControl(
        { value: subPillarItemTranslationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      lang: new FormControl(subPillarItemTranslationRawValue.lang, {
        validators: [Validators.required],
      }),
      name: new FormControl(subPillarItemTranslationRawValue.name, {
        validators: [Validators.required, Validators.maxLength(160)],
      }),
      description: new FormControl(subPillarItemTranslationRawValue.description, {
        validators: [Validators.maxLength(700)],
      }),
      subPillarItem: new FormControl(subPillarItemTranslationRawValue.subPillarItem, {
        validators: [Validators.required],
      }),
    });
  }

  getSubPillarItemTranslation(
    form: SubPillarItemTranslationFormGroup,
  ): ISubPillarItemTranslation | NewSubPillarItemTranslation {
    return form.getRawValue() as ISubPillarItemTranslation | NewSubPillarItemTranslation;
  }

  resetForm(form: SubPillarItemTranslationFormGroup, subPillarItemTranslation: SubPillarItemTranslationFormGroupInput): void {
    const subPillarItemTranslationRawValue = { ...this.getFormDefaults(), ...subPillarItemTranslation };
    form.reset(
      {
        ...subPillarItemTranslationRawValue,
        id: { value: subPillarItemTranslationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): SubPillarItemTranslationFormDefaults {
    return {
      id: null,
    };
  }
}
