import { ISubPillarTranslation, NewSubPillarTranslation } from './sub-pillar-translation.model';

export const sampleWithRequiredData: ISubPillarTranslation = {
  id: 663,
  lang: 'EN',
  name: 'finally truthfully',
};

export const sampleWithPartialData: ISubPillarTranslation = {
  id: 23519,
  lang: 'EN',
  name: 'white',
  description: 'reboot yowza',
};

export const sampleWithFullData: ISubPillarTranslation = {
  id: 24655,
  lang: 'FR',
  name: 'incomplete belabor',
  description: 'hmph ha',
};

export const sampleWithNewData: NewSubPillarTranslation = {
  lang: 'EN',
  name: 'even tomorrow phooey',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
