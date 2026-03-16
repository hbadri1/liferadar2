import { ISubPillar, NewSubPillar } from './sub-pillar.model';

export const sampleWithRequiredData: ISubPillar = {
  id: 4603,
  code: 'lest geez overcook',
  isActive: false,
};

export const sampleWithPartialData: ISubPillar = {
  id: 30697,
  code: 'vacantly however clinking',
  isActive: false,
};

export const sampleWithFullData: ISubPillar = {
  id: 8027,
  code: 'so',
  isActive: false,
};

export const sampleWithNewData: NewSubPillar = {
  code: 'psst brook',
  isActive: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
