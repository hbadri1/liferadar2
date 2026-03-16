import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ISubPillarItem, NewSubPillarItem } from '../sub-pillar-item.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISubPillarItem for edit and NewSubPillarItemFormGroupInput for create.
 */
type SubPillarItemFormGroupInput = ISubPillarItem | PartialWithRequiredKeyOf<NewSubPillarItem>;

type SubPillarItemFormDefaults = Pick<NewSubPillarItem, 'id' | 'isActive'>;

type SubPillarItemFormGroupContent = {
  id: FormControl<ISubPillarItem['id'] | NewSubPillarItem['id']>;
  code: FormControl<ISubPillarItem['code']>;
  sortOrder: FormControl<ISubPillarItem['sortOrder']>;
  isActive: FormControl<ISubPillarItem['isActive']>;
  subPillar: FormControl<ISubPillarItem['subPillar']>;
};

export type SubPillarItemFormGroup = FormGroup<SubPillarItemFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SubPillarItemFormService {
  createSubPillarItemFormGroup(subPillarItem: SubPillarItemFormGroupInput = { id: null }): SubPillarItemFormGroup {
    const subPillarItemRawValue = {
      ...this.getFormDefaults(),
      ...subPillarItem,
    };
    return new FormGroup<SubPillarItemFormGroupContent>({
      id: new FormControl(
        { value: subPillarItemRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(subPillarItemRawValue.code, {
        validators: [Validators.required, Validators.maxLength(80)],
      }),
      sortOrder: new FormControl(subPillarItemRawValue.sortOrder, {
        validators: [Validators.min(1)],
      }),
      isActive: new FormControl(subPillarItemRawValue.isActive, {
        validators: [Validators.required],
      }),
      subPillar: new FormControl(subPillarItemRawValue.subPillar, {
        validators: [Validators.required],
      }),
    });
  }

  getSubPillarItem(form: SubPillarItemFormGroup): ISubPillarItem | NewSubPillarItem {
    return form.getRawValue() as ISubPillarItem | NewSubPillarItem;
  }

  resetForm(form: SubPillarItemFormGroup, subPillarItem: SubPillarItemFormGroupInput): void {
    const subPillarItemRawValue = { ...this.getFormDefaults(), ...subPillarItem };
    form.reset(
      {
        ...subPillarItemRawValue,
        id: { value: subPillarItemRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): SubPillarItemFormDefaults {
    return {
      id: null,
      isActive: false,
    };
  }
}
