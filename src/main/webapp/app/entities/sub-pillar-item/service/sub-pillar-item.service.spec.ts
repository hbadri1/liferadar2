import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ISubPillarItem } from '../sub-pillar-item.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../sub-pillar-item.test-samples';

import { SubPillarItemService } from './sub-pillar-item.service';

const requireRestSample: ISubPillarItem = {
  ...sampleWithRequiredData,
};

describe('SubPillarItem Service', () => {
  let service: SubPillarItemService;
  let httpMock: HttpTestingController;
  let expectedResult: ISubPillarItem | ISubPillarItem[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(SubPillarItemService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a SubPillarItem', () => {
      const subPillarItem = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(subPillarItem).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a SubPillarItem', () => {
      const subPillarItem = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(subPillarItem).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a SubPillarItem', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of SubPillarItem', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a SubPillarItem', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addSubPillarItemToCollectionIfMissing', () => {
      it('should add a SubPillarItem to an empty array', () => {
        const subPillarItem: ISubPillarItem = sampleWithRequiredData;
        expectedResult = service.addSubPillarItemToCollectionIfMissing([], subPillarItem);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subPillarItem);
      });

      it('should not add a SubPillarItem to an array that contains it', () => {
        const subPillarItem: ISubPillarItem = sampleWithRequiredData;
        const subPillarItemCollection: ISubPillarItem[] = [
          {
            ...subPillarItem,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addSubPillarItemToCollectionIfMissing(subPillarItemCollection, subPillarItem);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a SubPillarItem to an array that doesn't contain it", () => {
        const subPillarItem: ISubPillarItem = sampleWithRequiredData;
        const subPillarItemCollection: ISubPillarItem[] = [sampleWithPartialData];
        expectedResult = service.addSubPillarItemToCollectionIfMissing(subPillarItemCollection, subPillarItem);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subPillarItem);
      });

      it('should add only unique SubPillarItem to an array', () => {
        const subPillarItemArray: ISubPillarItem[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const subPillarItemCollection: ISubPillarItem[] = [sampleWithRequiredData];
        expectedResult = service.addSubPillarItemToCollectionIfMissing(subPillarItemCollection, ...subPillarItemArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const subPillarItem: ISubPillarItem = sampleWithRequiredData;
        const subPillarItem2: ISubPillarItem = sampleWithPartialData;
        expectedResult = service.addSubPillarItemToCollectionIfMissing([], subPillarItem, subPillarItem2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subPillarItem);
        expect(expectedResult).toContain(subPillarItem2);
      });

      it('should accept null and undefined values', () => {
        const subPillarItem: ISubPillarItem = sampleWithRequiredData;
        expectedResult = service.addSubPillarItemToCollectionIfMissing([], null, subPillarItem, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subPillarItem);
      });

      it('should return initial array if no SubPillarItem is added', () => {
        const subPillarItemCollection: ISubPillarItem[] = [sampleWithRequiredData];
        expectedResult = service.addSubPillarItemToCollectionIfMissing(subPillarItemCollection, undefined, null);
        expect(expectedResult).toEqual(subPillarItemCollection);
      });
    });

    describe('compareSubPillarItem', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareSubPillarItem(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 7992 };
        const entity2 = null;

        const compareResult1 = service.compareSubPillarItem(entity1, entity2);
        const compareResult2 = service.compareSubPillarItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 7992 };
        const entity2 = { id: 25568 };

        const compareResult1 = service.compareSubPillarItem(entity1, entity2);
        const compareResult2 = service.compareSubPillarItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 7992 };
        const entity2 = { id: 7992 };

        const compareResult1 = service.compareSubPillarItem(entity1, entity2);
        const compareResult2 = service.compareSubPillarItem(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
