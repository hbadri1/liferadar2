import { ILifePillar, NewLifePillar } from './life-pillar.model';

export const sampleWithRequiredData: ILifePillar = {
  id: 18535,
  code: 'birdcage pish',
  isActive: false,
};

export const sampleWithPartialData: ILifePillar = {
  id: 20326,
  code: 'wise',
  isActive: false,
};

export const sampleWithFullData: ILifePillar = {
  id: 1137,
  code: 'cleverly hunger',
  isActive: false,
};

export const sampleWithNewData: NewLifePillar = {
  code: 'mid denitrify yuck',
  isActive: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
