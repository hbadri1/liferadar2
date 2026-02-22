import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IEvaluationDecision, NewEvaluationDecision } from '../evaluation-decision.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IEvaluationDecision for edit and NewEvaluationDecisionFormGroupInput for create.
 */
type EvaluationDecisionFormGroupInput = IEvaluationDecision | PartialWithRequiredKeyOf<NewEvaluationDecision>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IEvaluationDecision | NewEvaluationDecision> = Omit<T, 'date'> & {
  date?: string | null;
};

type EvaluationDecisionFormRawValue = FormValueOf<IEvaluationDecision>;

type NewEvaluationDecisionFormRawValue = FormValueOf<NewEvaluationDecision>;

type EvaluationDecisionFormDefaults = Pick<NewEvaluationDecision, 'id' | 'date'>;

type EvaluationDecisionFormGroupContent = {
  id: FormControl<EvaluationDecisionFormRawValue['id'] | NewEvaluationDecision['id']>;
  decision: FormControl<EvaluationDecisionFormRawValue['decision']>;
  date: FormControl<EvaluationDecisionFormRawValue['date']>;
  owner: FormControl<EvaluationDecisionFormRawValue['owner']>;
  lifeEvaluation: FormControl<EvaluationDecisionFormRawValue['lifeEvaluation']>;
};

export type EvaluationDecisionFormGroup = FormGroup<EvaluationDecisionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class EvaluationDecisionFormService {
  createEvaluationDecisionFormGroup(evaluationDecision: EvaluationDecisionFormGroupInput = { id: null }): EvaluationDecisionFormGroup {
    const evaluationDecisionRawValue = this.convertEvaluationDecisionToEvaluationDecisionRawValue({
      ...this.getFormDefaults(),
      ...evaluationDecision,
    });
    return new FormGroup<EvaluationDecisionFormGroupContent>({
      id: new FormControl(
        { value: evaluationDecisionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      decision: new FormControl(evaluationDecisionRawValue.decision, {
        validators: [Validators.required, Validators.maxLength(500)],
      }),
      date: new FormControl(evaluationDecisionRawValue.date),
      owner: new FormControl(evaluationDecisionRawValue.owner, {
        validators: [Validators.required],
      }),
      lifeEvaluation: new FormControl(evaluationDecisionRawValue.lifeEvaluation, {
        validators: [Validators.required],
      }),
    });
  }

  getEvaluationDecision(form: EvaluationDecisionFormGroup): IEvaluationDecision | NewEvaluationDecision {
    return this.convertEvaluationDecisionRawValueToEvaluationDecision(
      form.getRawValue() as EvaluationDecisionFormRawValue | NewEvaluationDecisionFormRawValue,
    );
  }

  resetForm(form: EvaluationDecisionFormGroup, evaluationDecision: EvaluationDecisionFormGroupInput): void {
    const evaluationDecisionRawValue = this.convertEvaluationDecisionToEvaluationDecisionRawValue({
      ...this.getFormDefaults(),
      ...evaluationDecision,
    });
    form.reset(
      {
        ...evaluationDecisionRawValue,
        id: { value: evaluationDecisionRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): EvaluationDecisionFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      date: currentTime,
    };
  }

  private convertEvaluationDecisionRawValueToEvaluationDecision(
    rawEvaluationDecision: EvaluationDecisionFormRawValue | NewEvaluationDecisionFormRawValue,
  ): IEvaluationDecision | NewEvaluationDecision {
    return {
      ...rawEvaluationDecision,
      date: dayjs(rawEvaluationDecision.date, DATE_TIME_FORMAT),
    };
  }

  private convertEvaluationDecisionToEvaluationDecisionRawValue(
    evaluationDecision: IEvaluationDecision | (Partial<NewEvaluationDecision> & EvaluationDecisionFormDefaults),
  ): EvaluationDecisionFormRawValue | PartialWithRequiredKeyOf<NewEvaluationDecisionFormRawValue> {
    return {
      ...evaluationDecision,
      date: evaluationDecision.date ? evaluationDecision.date.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
