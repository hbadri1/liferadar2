import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IPillar, NewPillar } from '../pillar.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPillar for edit and NewPillarFormGroupInput for create.
 */
type PillarFormGroupInput = IPillar | PartialWithRequiredKeyOf<NewPillar>;

type PillarFormDefaults = Pick<NewPillar, 'id' | 'isActive'>;

type PillarFormGroupContent = {
  id: FormControl<IPillar['id'] | NewPillar['id']>;
  code: FormControl<IPillar['code']>;
  isActive: FormControl<IPillar['isActive']>;
};

export type PillarFormGroup = FormGroup<PillarFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PillarFormService {
  createPillarFormGroup(pillar: PillarFormGroupInput = { id: null }): PillarFormGroup {
    const pillarRawValue = {
      ...this.getFormDefaults(),
      ...pillar,
    };
    return new FormGroup<PillarFormGroupContent>({
      id: new FormControl(
        { value: pillarRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(pillarRawValue.code, {
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      isActive: new FormControl(pillarRawValue.isActive, {
        validators: [Validators.required],
      }),
    });
  }

  getPillar(form: PillarFormGroup): IPillar | NewPillar {
    return form.getRawValue() as IPillar | NewPillar;
  }

  resetForm(form: PillarFormGroup, pillar: PillarFormGroupInput): void {
    const pillarRawValue = { ...this.getFormDefaults(), ...pillar };
    form.reset(
      {
        ...pillarRawValue,
        id: { value: pillarRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): PillarFormDefaults {
    return {
      id: null,
      isActive: false,
    };
  }
}
