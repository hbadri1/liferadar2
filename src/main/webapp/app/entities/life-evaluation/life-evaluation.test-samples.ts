import dayjs from 'dayjs/esm';

import { ILifeEvaluation, NewLifeEvaluation } from './life-evaluation.model';

export const sampleWithRequiredData: ILifeEvaluation = {
  id: 19165,
  evaluationDate: dayjs('2026-02-18'),
  score: 10,
};

export const sampleWithPartialData: ILifeEvaluation = {
  id: 24341,
  evaluationDate: dayjs('2026-02-18'),
  reminderEnabled: true,
  reminderAt: dayjs('2026-02-18T04:16'),
  score: 6,
  notes: 'gape aftermath sustenance',
};

export const sampleWithFullData: ILifeEvaluation = {
  id: 24857,
  evaluationDate: dayjs('2026-02-18'),
  reminderEnabled: true,
  reminderAt: dayjs('2026-02-18T06:40'),
  score: 7,
  notes: 'scowl',
};

export const sampleWithNewData: NewLifeEvaluation = {
  evaluationDate: dayjs('2026-02-18'),
  score: 4,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
