import { ISubLifePillar } from 'app/entities/sub-life-pillar/sub-life-pillar.model';
import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ISubLifePillarItemTranslation } from 'app/entities/sub-life-pillar-item-translation/sub-life-pillar-item-translation.model';

export interface ISubLifePillarItem {
  id: number;
  code?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  translations?: ISubLifePillarItemTranslation[] | null;
  subLifePillar?: ISubLifePillar | null;
  owner?: IExtendedUser | null;
}

export type NewSubLifePillarItem = Omit<ISubLifePillarItem, 'id'> & { id: null };
