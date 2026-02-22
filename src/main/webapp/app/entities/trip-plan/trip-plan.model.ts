import dayjs from 'dayjs/esm';
import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';

export interface ITripPlan {
  id: number;
  title?: string | null;
  description?: string | null;
  startDate?: dayjs.Dayjs | null;
  endDate?: dayjs.Dayjs | null;
  owner?: IExtendedUser | null;
}

export type NewTripPlan = Omit<ITripPlan, 'id'> & { id: null };
