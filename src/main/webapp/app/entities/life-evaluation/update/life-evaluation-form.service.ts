import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ILifeEvaluation, NewLifeEvaluation } from '../life-evaluation.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ILifeEvaluation for edit and NewLifeEvaluationFormGroupInput for create.
 */
type LifeEvaluationFormGroupInput = ILifeEvaluation | PartialWithRequiredKeyOf<NewLifeEvaluation>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ILifeEvaluation | NewLifeEvaluation> = Omit<T, 'reminderAt'> & {
  reminderAt?: string | null;
};

type LifeEvaluationFormRawValue = FormValueOf<ILifeEvaluation>;

type NewLifeEvaluationFormRawValue = FormValueOf<NewLifeEvaluation>;

type LifeEvaluationFormDefaults = Pick<NewLifeEvaluation, 'id' | 'reminderEnabled' | 'reminderAt'>;

type LifeEvaluationFormGroupContent = {
  id: FormControl<LifeEvaluationFormRawValue['id'] | NewLifeEvaluation['id']>;
  evaluationDate: FormControl<LifeEvaluationFormRawValue['evaluationDate']>;
  reminderEnabled: FormControl<LifeEvaluationFormRawValue['reminderEnabled']>;
  reminderAt: FormControl<LifeEvaluationFormRawValue['reminderAt']>;
  score: FormControl<LifeEvaluationFormRawValue['score']>;
  notes: FormControl<LifeEvaluationFormRawValue['notes']>;
  owner: FormControl<LifeEvaluationFormRawValue['owner']>;
  subLifePillarItem: FormControl<LifeEvaluationFormRawValue['subLifePillarItem']>;
};

export type LifeEvaluationFormGroup = FormGroup<LifeEvaluationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class LifeEvaluationFormService {
  createLifeEvaluationFormGroup(lifeEvaluation: LifeEvaluationFormGroupInput = { id: null }): LifeEvaluationFormGroup {
    const lifeEvaluationRawValue = this.convertLifeEvaluationToLifeEvaluationRawValue({
      ...this.getFormDefaults(),
      ...lifeEvaluation,
    });
    return new FormGroup<LifeEvaluationFormGroupContent>({
      id: new FormControl(
        { value: lifeEvaluationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      evaluationDate: new FormControl(lifeEvaluationRawValue.evaluationDate, {
        validators: [Validators.required],
      }),
      reminderEnabled: new FormControl(lifeEvaluationRawValue.reminderEnabled),
      reminderAt: new FormControl(lifeEvaluationRawValue.reminderAt),
      score: new FormControl(lifeEvaluationRawValue.score, {
        validators: [Validators.required, Validators.min(1), Validators.max(10)],
      }),
      notes: new FormControl(lifeEvaluationRawValue.notes, {
        validators: [Validators.maxLength(800)],
      }),
      owner: new FormControl(lifeEvaluationRawValue.owner, {
        validators: [Validators.required],
      }),
      subLifePillarItem: new FormControl(lifeEvaluationRawValue.subLifePillarItem, {
        validators: [Validators.required],
      }),
    });
  }

  getLifeEvaluation(form: LifeEvaluationFormGroup): ILifeEvaluation | NewLifeEvaluation {
    return this.convertLifeEvaluationRawValueToLifeEvaluation(
      form.getRawValue() as LifeEvaluationFormRawValue | NewLifeEvaluationFormRawValue,
    );
  }

  resetForm(form: LifeEvaluationFormGroup, lifeEvaluation: LifeEvaluationFormGroupInput): void {
    const lifeEvaluationRawValue = this.convertLifeEvaluationToLifeEvaluationRawValue({ ...this.getFormDefaults(), ...lifeEvaluation });
    form.reset(
      {
        ...lifeEvaluationRawValue,
        id: { value: lifeEvaluationRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): LifeEvaluationFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      reminderEnabled: false,
      reminderAt: currentTime,
    };
  }

  private convertLifeEvaluationRawValueToLifeEvaluation(
    rawLifeEvaluation: LifeEvaluationFormRawValue | NewLifeEvaluationFormRawValue,
  ): ILifeEvaluation | NewLifeEvaluation {
    return {
      ...rawLifeEvaluation,
      reminderAt: dayjs(rawLifeEvaluation.reminderAt, DATE_TIME_FORMAT),
    };
  }

  private convertLifeEvaluationToLifeEvaluationRawValue(
    lifeEvaluation: ILifeEvaluation | (Partial<NewLifeEvaluation> & LifeEvaluationFormDefaults),
  ): LifeEvaluationFormRawValue | PartialWithRequiredKeyOf<NewLifeEvaluationFormRawValue> {
    return {
      ...lifeEvaluation,
      reminderAt: lifeEvaluation.reminderAt ? lifeEvaluation.reminderAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
