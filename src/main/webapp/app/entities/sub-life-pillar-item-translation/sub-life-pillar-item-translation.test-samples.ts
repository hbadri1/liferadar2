import { ISubLifePillarItemTranslation, NewSubLifePillarItemTranslation } from './sub-life-pillar-item-translation.model';

export const sampleWithRequiredData: ISubLifePillarItemTranslation = {
  id: 244,
  lang: 'FR',
  name: 'short-term',
};

export const sampleWithPartialData: ISubLifePillarItemTranslation = {
  id: 28439,
  lang: 'EN',
  name: 'zowie until equate',
};

export const sampleWithFullData: ISubLifePillarItemTranslation = {
  id: 10259,
  lang: 'AR',
  name: 'hmph',
  description: 'ick heartache',
};

export const sampleWithNewData: NewSubLifePillarItemTranslation = {
  lang: 'FR',
  name: 'boo zowie',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
