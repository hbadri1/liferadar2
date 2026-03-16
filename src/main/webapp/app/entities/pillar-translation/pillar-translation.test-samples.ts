import { IPillarTranslation, NewPillarTranslation } from './pillar-translation.model';

export const sampleWithRequiredData: IPillarTranslation = {
  id: 22109,
  lang: 'AR',
  name: 'where gee',
};

export const sampleWithPartialData: IPillarTranslation = {
  id: 17152,
  lang: 'EN',
  name: 'after',
};

export const sampleWithFullData: IPillarTranslation = {
  id: 15181,
  lang: 'AR',
  name: 'turbulent spark',
  description: 'boohoo as so',
};

export const sampleWithNewData: NewPillarTranslation = {
  lang: 'AR',
  name: 'membership suburban',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
