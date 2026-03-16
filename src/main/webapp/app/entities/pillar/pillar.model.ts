import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { IPillarTranslation } from 'app/entities/pillar-translation/pillar-translation.model';

export interface IPillar {
  id: number;
  code?: string | null;
  isActive?: boolean | null;
  translations?: IPillarTranslation[] | null;
  owner?: IExtendedUser | null;
}

export type NewPillar = Omit<IPillar, 'id'> & { id: null };
