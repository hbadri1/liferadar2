import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { IPillar } from 'app/entities/pillar/pillar.model';
import { ISubPillarTranslation } from 'app/entities/sub-pillar-translation/sub-pillar-translation.model';

export interface ISubPillar {
  id: number;
  code?: string | null;
  isActive?: boolean | null;
  translations?: ISubPillarTranslation[] | null;
  pillar?: IPillar | null;
  owner?: IExtendedUser | null;
}

export type NewSubPillar = Omit<ISubPillar, 'id'> & { id: null };
