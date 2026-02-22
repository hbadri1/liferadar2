import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';

export interface ISubLifePillarItem {
  id: number;
  code?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  owner?: IExtendedUser | null;
}

export type NewSubLifePillarItem = Omit<ISubLifePillarItem, 'id'> & { id: null };
