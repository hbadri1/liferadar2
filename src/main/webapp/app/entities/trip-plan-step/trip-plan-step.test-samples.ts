import dayjs from 'dayjs/esm';

import { ITripPlanStep, NewTripPlanStep } from './trip-plan-step.model';

export const sampleWithRequiredData: ITripPlanStep = {
  id: 24628,
  startDate: dayjs('2026-02-18'),
  endDate: dayjs('2026-02-18'),
  actionName: 'preside avaricious',
  sequence: 6636,
};

export const sampleWithPartialData: ITripPlanStep = {
  id: 17110,
  startDate: dayjs('2026-02-18'),
  endDate: dayjs('2026-02-18'),
  actionName: 'fooey',
  sequence: 5245,
};

export const sampleWithFullData: ITripPlanStep = {
  id: 20422,
  startDate: dayjs('2026-02-18'),
  endDate: dayjs('2026-02-18'),
  actionName: 'clamor excepting reproach',
  sequence: 7043,
  notes: 'keel furiously perp',
};

export const sampleWithNewData: NewTripPlanStep = {
  startDate: dayjs('2026-02-17'),
  endDate: dayjs('2026-02-17'),
  actionName: 'claw best',
  sequence: 983,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
