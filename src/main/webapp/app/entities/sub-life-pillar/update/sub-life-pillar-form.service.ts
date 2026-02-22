import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ISubLifePillar, NewSubLifePillar } from '../sub-life-pillar.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISubLifePillar for edit and NewSubLifePillarFormGroupInput for create.
 */
type SubLifePillarFormGroupInput = ISubLifePillar | PartialWithRequiredKeyOf<NewSubLifePillar>;

type SubLifePillarFormDefaults = Pick<NewSubLifePillar, 'id' | 'isActive'>;

type SubLifePillarFormGroupContent = {
  id: FormControl<ISubLifePillar['id'] | NewSubLifePillar['id']>;
  code: FormControl<ISubLifePillar['code']>;
  isActive: FormControl<ISubLifePillar['isActive']>;
  owner: FormControl<ISubLifePillar['owner']>;
};

export type SubLifePillarFormGroup = FormGroup<SubLifePillarFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SubLifePillarFormService {
  createSubLifePillarFormGroup(subLifePillar: SubLifePillarFormGroupInput = { id: null }): SubLifePillarFormGroup {
    const subLifePillarRawValue = {
      ...this.getFormDefaults(),
      ...subLifePillar,
    };
    return new FormGroup<SubLifePillarFormGroupContent>({
      id: new FormControl(
        { value: subLifePillarRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(subLifePillarRawValue.code, {
        validators: [Validators.required, Validators.maxLength(60)],
      }),
      isActive: new FormControl(subLifePillarRawValue.isActive, {
        validators: [Validators.required],
      }),
      owner: new FormControl(subLifePillarRawValue.owner, {
        validators: [Validators.required],
      }),
    });
  }

  getSubLifePillar(form: SubLifePillarFormGroup): ISubLifePillar | NewSubLifePillar {
    return form.getRawValue() as ISubLifePillar | NewSubLifePillar;
  }

  resetForm(form: SubLifePillarFormGroup, subLifePillar: SubLifePillarFormGroupInput): void {
    const subLifePillarRawValue = { ...this.getFormDefaults(), ...subLifePillar };
    form.reset(
      {
        ...subLifePillarRawValue,
        id: { value: subLifePillarRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): SubLifePillarFormDefaults {
    return {
      id: null,
      isActive: false,
    };
  }
}
