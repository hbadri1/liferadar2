import { ISubPillar } from 'app/entities/sub-pillar/sub-pillar.model';
import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ISubPillarItemTranslation } from 'app/entities/sub-pillar-item-translation/sub-pillar-item-translation.model';

export interface ISubPillarItem {
  id: number;
  code?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  translations?: ISubPillarItemTranslation[] | null;
  subPillar?: ISubPillar | null;
  owner?: IExtendedUser | null;
}

export type NewSubPillarItem = Omit<ISubPillarItem, 'id'> & { id: null };
