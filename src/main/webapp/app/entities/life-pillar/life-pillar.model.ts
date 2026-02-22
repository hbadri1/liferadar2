import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';

export interface ILifePillar {
  id: number;
  code?: string | null;
  isActive?: boolean | null;
  owner?: IExtendedUser | null;
}

export type NewLifePillar = Omit<ILifePillar, 'id'> & { id: null };
