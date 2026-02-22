import { IExtendedUser, NewExtendedUser } from './extended-user.model';

export const sampleWithRequiredData: IExtendedUser = {
  id: 505,
  fullName: 'from fiercely fooey',
  active: true,
};

export const sampleWithPartialData: IExtendedUser = {
  id: 11437,
  fullName: 'lest which schematise',
  mobile: 'till ack',
  avatar: 'tail bitter',
  active: true,
};

export const sampleWithFullData: IExtendedUser = {
  id: 10595,
  fullName: 'solemnly selfish',
  mobile: 'sans cope',
  avatar: 'how against',
  active: false,
};

export const sampleWithNewData: NewExtendedUser = {
  fullName: 'sans designation mid',
  active: true,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
