import dayjs from 'dayjs/esm';

import { IEvaluationDecision, NewEvaluationDecision } from './evaluation-decision.model';

export const sampleWithRequiredData: IEvaluationDecision = {
  id: 418,
  decision: 'arcade minus over',
};

export const sampleWithPartialData: IEvaluationDecision = {
  id: 3811,
  decision: 'own duh',
};

export const sampleWithFullData: IEvaluationDecision = {
  id: 17213,
  decision: 'strict blah',
  date: dayjs('2026-02-18T05:51'),
};

export const sampleWithNewData: NewEvaluationDecision = {
  decision: 'sedately',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
