import { IPillar, NewPillar } from './pillar.model';

export const sampleWithRequiredData: IPillar = {
  id: 18535,
  code: 'birdcage pish',
  isActive: false,
};

export const sampleWithPartialData: IPillar = {
  id: 20326,
  code: 'wise',
  isActive: false,
};

export const sampleWithFullData: IPillar = {
  id: 1137,
  code: 'cleverly hunger',
  isActive: false,
};

export const sampleWithNewData: NewPillar = {
  code: 'mid denitrify yuck',
  isActive: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
