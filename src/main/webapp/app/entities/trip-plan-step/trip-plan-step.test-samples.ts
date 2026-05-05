import dayjs from 'dayjs/esm';

import { ITripPlanStep, NewTripPlanStep } from './trip-plan-step.model';

export const sampleWithRequiredData: ITripPlanStep = {
  id: 24628,
  startDate: dayjs('2026-02-18T09:00'),
  endDate: dayjs('2026-02-18T10:00'),
  actionName: 'preside avaricious',
  sequence: 6636,
};

export const sampleWithPartialData: ITripPlanStep = {
  id: 17110,
  startDate: dayjs('2026-02-18T11:00'),
  endDate: dayjs('2026-02-18T12:00'),
  actionName: 'fooey',
  sequence: 5245,
};

export const sampleWithFullData: ITripPlanStep = {
  id: 20422,
  startDate: dayjs('2026-02-18T13:00'),
  endDate: dayjs('2026-02-18T14:00'),
  actionName: 'clamor excepting reproach',
  sequence: 7043,
  notes: 'keel furiously perp',
};

export const sampleWithNewData: NewTripPlanStep = {
  startDate: dayjs('2026-02-17T08:00'),
  endDate: dayjs('2026-02-17T09:00'),
  actionName: 'claw best',
  sequence: 983,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
