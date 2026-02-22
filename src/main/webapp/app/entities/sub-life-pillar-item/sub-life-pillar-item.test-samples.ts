import { ISubLifePillarItem, NewSubLifePillarItem } from './sub-life-pillar-item.model';

export const sampleWithRequiredData: ISubLifePillarItem = {
  id: 23765,
  code: 'honestly ah remark',
  isActive: true,
};

export const sampleWithPartialData: ISubLifePillarItem = {
  id: 20292,
  code: 'aside',
  isActive: true,
};

export const sampleWithFullData: ISubLifePillarItem = {
  id: 7756,
  code: 'polished until',
  sortOrder: 25553,
  isActive: false,
};

export const sampleWithNewData: NewSubLifePillarItem = {
  code: 'petal basic knavishly',
  isActive: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
