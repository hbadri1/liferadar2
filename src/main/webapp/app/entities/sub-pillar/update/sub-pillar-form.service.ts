import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ISubPillar, NewSubPillar } from '../sub-pillar.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ISubPillar for edit and NewSubPillarFormGroupInput for create.
 */
type SubPillarFormGroupInput = ISubPillar | PartialWithRequiredKeyOf<NewSubPillar>;

type SubPillarFormDefaults = Pick<NewSubPillar, 'id' | 'isActive'>;

type SubPillarFormGroupContent = {
  id: FormControl<ISubPillar['id'] | NewSubPillar['id']>;
  code: FormControl<ISubPillar['code']>;
  isActive: FormControl<ISubPillar['isActive']>;
  pillar: FormControl<ISubPillar['pillar']>;
};

export type SubPillarFormGroup = FormGroup<SubPillarFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class SubPillarFormService {
  createSubPillarFormGroup(subPillar: SubPillarFormGroupInput = { id: null }): SubPillarFormGroup {
    const subPillarRawValue = {
      ...this.getFormDefaults(),
      ...subPillar,
    };
    return new FormGroup<SubPillarFormGroupContent>({
      id: new FormControl(
        { value: subPillarRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(subPillarRawValue.code, {
        validators: [Validators.required, Validators.maxLength(60)],
      }),
      isActive: new FormControl(subPillarRawValue.isActive, {
        validators: [Validators.required],
      }),
      pillar: new FormControl(subPillarRawValue.pillar, {
        validators: [Validators.required],
      }),
    });
  }

  getSubPillar(form: SubPillarFormGroup): ISubPillar | NewSubPillar {
    return form.getRawValue() as ISubPillar | NewSubPillar;
  }

  resetForm(form: SubPillarFormGroup, subPillar: SubPillarFormGroupInput): void {
    const subPillarRawValue = { ...this.getFormDefaults(), ...subPillar };
    form.reset(
      {
        ...subPillarRawValue,
        id: { value: subPillarRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): SubPillarFormDefaults {
    return {
      id: null,
      isActive: false,
    };
  }
}
