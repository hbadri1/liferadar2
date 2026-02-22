import { ILifePillarTranslation, NewLifePillarTranslation } from './life-pillar-translation.model';

export const sampleWithRequiredData: ILifePillarTranslation = {
  id: 22109,
  lang: 'AR',
  name: 'where gee',
};

export const sampleWithPartialData: ILifePillarTranslation = {
  id: 17152,
  lang: 'EN',
  name: 'after',
};

export const sampleWithFullData: ILifePillarTranslation = {
  id: 15181,
  lang: 'AR',
  name: 'turbulent spark',
  description: 'boohoo as so',
};

export const sampleWithNewData: NewLifePillarTranslation = {
  lang: 'AR',
  name: 'membership suburban',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
