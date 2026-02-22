import dayjs from 'dayjs/esm';
import { ITripPlan } from 'app/entities/trip-plan/trip-plan.model';

export interface ITripPlanStep {
  id: number;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  actionName?: string | null;
  sequence?: number | null;
  notes?: string | null;
  tripPlan?: ITripPlan | null;
}

export type NewTripPlanStep = Omit<ITripPlanStep, 'id'> & { id: null };
