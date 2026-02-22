import dayjs from 'dayjs/esm';

import { ITripPlan, NewTripPlan } from './trip-plan.model';

export const sampleWithRequiredData: ITripPlan = {
  id: 20321,
  title: 'thoughtfully pleased knowledgeably',
  startDate: dayjs('2026-02-18'),
  endDate: dayjs('2026-02-18'),
};

export const sampleWithPartialData: ITripPlan = {
  id: 19072,
  title: 'shrilly gosh',
  description: 'pro',
  startDate: dayjs('2026-02-18'),
  endDate: dayjs('2026-02-18'),
};

export const sampleWithFullData: ITripPlan = {
  id: 9874,
  title: 'scarcely brr profuse',
  description: 'but exaggerate',
  startDate: dayjs('2026-02-17'),
  endDate: dayjs('2026-02-17'),
};

export const sampleWithNewData: NewTripPlan = {
  title: 'consequently owlishly',
  startDate: dayjs('2026-02-17'),
  endDate: dayjs('2026-02-17'),
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
