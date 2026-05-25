import dayjs from 'dayjs/esm';
import { ITripPlan } from 'app/entities/trip-plan/trip-plan.model';

export interface ITripPlanSubStep {
  id?: number | null;
  actionName?: string | null;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  sequence?: number | null;
  notes?: string | null;
}

export interface ITripPlanStep {
  id: number;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  actionName?: string | null;
  sequence?: number | null;
  notes?: string | null;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  subSteps?: ITripPlanSubStep[] | null;
  tripPlan?: ITripPlan | null;
}

export type NewTripPlanStep = Omit<ITripPlanStep, 'id'> & { id: null };
