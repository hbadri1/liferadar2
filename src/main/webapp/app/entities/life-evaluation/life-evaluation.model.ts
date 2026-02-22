import dayjs from 'dayjs/esm';
import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ISubLifePillarItem } from 'app/entities/sub-life-pillar-item/sub-life-pillar-item.model';

export interface ILifeEvaluation {
  id: number;
  evaluationDate?: dayjs.Dayjs | null;
  reminderEnabled?: boolean | null;
  reminderAt?: dayjs.Dayjs | null;
  score?: number | null;
  notes?: string | null;
  owner?: IExtendedUser | null;
  subLifePillarItem?: ISubLifePillarItem | null;
}

export type NewLifeEvaluation = Omit<ILifeEvaluation, 'id'> & { id: null };
