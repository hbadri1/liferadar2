import { ISubLifePillarTranslation, NewSubLifePillarTranslation } from './sub-life-pillar-translation.model';

export const sampleWithRequiredData: ISubLifePillarTranslation = {
  id: 663,
  lang: 'EN',
  name: 'finally truthfully',
};

export const sampleWithPartialData: ISubLifePillarTranslation = {
  id: 23519,
  lang: 'EN',
  name: 'white',
  description: 'reboot yowza',
};

export const sampleWithFullData: ISubLifePillarTranslation = {
  id: 24655,
  lang: 'FR',
  name: 'incomplete belabor',
  description: 'hmph ha',
};

export const sampleWithNewData: NewSubLifePillarTranslation = {
  lang: 'EN',
  name: 'even tomorrow phooey',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
