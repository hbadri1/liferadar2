import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ISubLifePillarItem, NewSubLifePillarItem } from '../sub-life-pillar-item.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISubLifePillarItem for edit and NewSubLifePillarItemFormGroupInput for create.
 */
type SubLifePillarItemFormGroupInput = ISubLifePillarItem | PartialWithRequiredKeyOf<NewSubLifePillarItem>;

type SubLifePillarItemFormDefaults = Pick<NewSubLifePillarItem, 'id' | 'isActive'>;

type SubLifePillarItemFormGroupContent = {
  id: FormControl<ISubLifePillarItem['id'] | NewSubLifePillarItem['id']>;
  code: FormControl<ISubLifePillarItem['code']>;
  sortOrder: FormControl<ISubLifePillarItem['sortOrder']>;
  isActive: FormControl<ISubLifePillarItem['isActive']>;
  owner: FormControl<ISubLifePillarItem['owner']>;
};

export type SubLifePillarItemFormGroup = FormGroup<SubLifePillarItemFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SubLifePillarItemFormService {
  createSubLifePillarItemFormGroup(subLifePillarItem: SubLifePillarItemFormGroupInput = { id: null }): SubLifePillarItemFormGroup {
    const subLifePillarItemRawValue = {
      ...this.getFormDefaults(),
      ...subLifePillarItem,
    };
    return new FormGroup<SubLifePillarItemFormGroupContent>({
      id: new FormControl(
        { value: subLifePillarItemRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(subLifePillarItemRawValue.code, {
        validators: [Validators.required, Validators.maxLength(80)],
      }),
      sortOrder: new FormControl(subLifePillarItemRawValue.sortOrder, {
        validators: [Validators.min(1)],
      }),
      isActive: new FormControl(subLifePillarItemRawValue.isActive, {
        validators: [Validators.required],
      }),
      owner: new FormControl(subLifePillarItemRawValue.owner, {
        validators: [Validators.required],
      }),
    });
  }

  getSubLifePillarItem(form: SubLifePillarItemFormGroup): ISubLifePillarItem | NewSubLifePillarItem {
    return form.getRawValue() as ISubLifePillarItem | NewSubLifePillarItem;
  }

  resetForm(form: SubLifePillarItemFormGroup, subLifePillarItem: SubLifePillarItemFormGroupInput): void {
    const subLifePillarItemRawValue = { ...this.getFormDefaults(), ...subLifePillarItem };
    form.reset(
      {
        ...subLifePillarItemRawValue,
        id: { value: subLifePillarItemRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): SubLifePillarItemFormDefaults {
    return {
      id: null,
      isActive: false,
    };
  }
}
