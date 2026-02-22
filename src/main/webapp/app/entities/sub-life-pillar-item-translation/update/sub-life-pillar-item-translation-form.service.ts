import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ISubLifePillarItemTranslation, NewSubLifePillarItemTranslation } from '../sub-life-pillar-item-translation.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISubLifePillarItemTranslation for edit and NewSubLifePillarItemTranslationFormGroupInput for create.
 */
type SubLifePillarItemTranslationFormGroupInput = ISubLifePillarItemTranslation | PartialWithRequiredKeyOf<NewSubLifePillarItemTranslation>;

type SubLifePillarItemTranslationFormDefaults = Pick<NewSubLifePillarItemTranslation, 'id'>;

type SubLifePillarItemTranslationFormGroupContent = {
  id: FormControl<ISubLifePillarItemTranslation['id'] | NewSubLifePillarItemTranslation['id']>;
  lang: FormControl<ISubLifePillarItemTranslation['lang']>;
  name: FormControl<ISubLifePillarItemTranslation['name']>;
  description: FormControl<ISubLifePillarItemTranslation['description']>;
  subLifePillarItem: FormControl<ISubLifePillarItemTranslation['subLifePillarItem']>;
};

export type SubLifePillarItemTranslationFormGroup = FormGroup<SubLifePillarItemTranslationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SubLifePillarItemTranslationFormService {
  createSubLifePillarItemTranslationFormGroup(
    subLifePillarItemTranslation: SubLifePillarItemTranslationFormGroupInput = { id: null },
  ): SubLifePillarItemTranslationFormGroup {
    const subLifePillarItemTranslationRawValue = {
      ...this.getFormDefaults(),
      ...subLifePillarItemTranslation,
    };
    return new FormGroup<SubLifePillarItemTranslationFormGroupContent>({
      id: new FormControl(
        { value: subLifePillarItemTranslationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      lang: new FormControl(subLifePillarItemTranslationRawValue.lang, {
        validators: [Validators.required],
      }),
      name: new FormControl(subLifePillarItemTranslationRawValue.name, {
        validators: [Validators.required, Validators.maxLength(160)],
      }),
      description: new FormControl(subLifePillarItemTranslationRawValue.description, {
        validators: [Validators.maxLength(700)],
      }),
      subLifePillarItem: new FormControl(subLifePillarItemTranslationRawValue.subLifePillarItem, {
        validators: [Validators.required],
      }),
    });
  }

  getSubLifePillarItemTranslation(
    form: SubLifePillarItemTranslationFormGroup,
  ): ISubLifePillarItemTranslation | NewSubLifePillarItemTranslation {
    return form.getRawValue() as ISubLifePillarItemTranslation | NewSubLifePillarItemTranslation;
  }

  resetForm(form: SubLifePillarItemTranslationFormGroup, subLifePillarItemTranslation: SubLifePillarItemTranslationFormGroupInput): void {
    const subLifePillarItemTranslationRawValue = { ...this.getFormDefaults(), ...subLifePillarItemTranslation };
    form.reset(
      {
        ...subLifePillarItemTranslationRawValue,
        id: { value: subLifePillarItemTranslationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): SubLifePillarItemTranslationFormDefaults {
    return {
      id: null,
    };
  }
}
