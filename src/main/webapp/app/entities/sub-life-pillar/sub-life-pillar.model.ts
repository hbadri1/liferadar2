import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ILifePillar } from 'app/entities/life-pillar/life-pillar.model';
import { ISubLifePillarTranslation } from 'app/entities/sub-life-pillar-translation/sub-life-pillar-translation.model';

export interface ISubLifePillar {
  id: number;
  code?: string | null;
  isActive?: boolean | null;
  translations?: ISubLifePillarTranslation[] | null;
  lifePillar?: ILifePillar | null;
  owner?: IExtendedUser | null;
}

export type NewSubLifePillar = Omit<ISubLifePillar, 'id'> & { id: null };
