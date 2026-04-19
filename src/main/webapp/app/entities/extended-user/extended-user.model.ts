import { IUser } from 'app/entities/user/user.model';

export interface IExtendedUser {
  id: number;
  fullName?: string | null;
  mobile?: string | null;
  avatar?: string | null;
  active?: boolean | null;
  timezone?: string | null;
  currency?: string | null;
  user?: Pick<IUser, 'id'> | null;
}

export type NewExtendedUser = Omit<IExtendedUser, 'id'> & { id: null };
