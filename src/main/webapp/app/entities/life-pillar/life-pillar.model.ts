import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ILifePillarTranslation } from 'app/entities/life-pillar-translation/life-pillar-translation.model';

export interface ILifePillar {
  id: number;
  code?: string | null;
  isActive?: boolean | null;
  translations?: ILifePillarTranslation[] | null;
  owner?: IExtendedUser | null;
}

export type NewLifePillar = Omit<ILifePillar, 'id'> & { id: null };
