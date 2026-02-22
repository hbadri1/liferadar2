import { ISubLifePillar, NewSubLifePillar } from './sub-life-pillar.model';

export const sampleWithRequiredData: ISubLifePillar = {
  id: 4603,
  code: 'lest geez overcook',
  isActive: false,
};

export const sampleWithPartialData: ISubLifePillar = {
  id: 30697,
  code: 'vacantly however clinking',
  isActive: false,
};

export const sampleWithFullData: ISubLifePillar = {
  id: 8027,
  code: 'so',
  isActive: false,
};

export const sampleWithNewData: NewSubLifePillar = {
  code: 'psst brook',
  isActive: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
