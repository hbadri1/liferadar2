import dayjs from 'dayjs/esm';

export interface IFamily {
  id: number;
  name: string;
  createdAt: dayjs.Dayjs;
  modifiedAt: dayjs.Dayjs;
}

export type NewFamily = Omit<IFamily, 'id'> & { id: null };

