import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';

export interface ISubLifePillar {
  id: number;
  code?: string | null;
  isActive?: boolean | null;
  owner?: IExtendedUser | null;
}

export type NewSubLifePillar = Omit<ISubLifePillar, 'id'> & { id: null };
