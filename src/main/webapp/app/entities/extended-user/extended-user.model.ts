import { IUser } from 'app/entities/user/user.model';
import { IFamily } from 'app/entities/family/family.model';

export interface IExtendedUser {
  id: number;
  fullName?: string | null;
  mobile?: string | null;
  avatar?: string | null;
  active?: boolean | null;
  timezone?: string | null;
  currency?: string | null;
  isParent?: boolean | null;
  familyManagementEnabled?: boolean | null;
  user?: Pick<IUser, 'id'> | null;
  family?: Pick<IFamily, 'id' | 'name'> | null;
}

export type NewExtendedUser = Omit<IExtendedUser, 'id'> & { id: null };
