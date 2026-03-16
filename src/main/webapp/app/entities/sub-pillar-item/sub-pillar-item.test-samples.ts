import { ISubPillarItem, NewSubPillarItem } from './sub-pillar-item.model';

export const sampleWithRequiredData: ISubPillarItem = {
  id: 23765,
  code: 'honestly ah remark',
  isActive: true,
};

export const sampleWithPartialData: ISubPillarItem = {
  id: 20292,
  code: 'aside',
  isActive: true,
};

export const sampleWithFullData: ISubPillarItem = {
  id: 7756,
  code: 'polished until',
  sortOrder: 25553,
  isActive: false,
};

export const sampleWithNewData: NewSubPillarItem = {
  code: 'petal basic knavishly',
  isActive: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
