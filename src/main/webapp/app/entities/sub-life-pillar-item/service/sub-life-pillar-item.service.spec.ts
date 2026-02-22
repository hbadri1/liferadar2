import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ISubLifePillarItem } from '../sub-life-pillar-item.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../sub-life-pillar-item.test-samples';

import { SubLifePillarItemService } from './sub-life-pillar-item.service';

const requireRestSample: ISubLifePillarItem = {
  ...sampleWithRequiredData,
};

describe('SubLifePillarItem Service', () => {
  let service: SubLifePillarItemService;
  let httpMock: HttpTestingController;
  let expectedResult: ISubLifePillarItem | ISubLifePillarItem[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(SubLifePillarItemService);
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

    it('should create a SubLifePillarItem', () => {
      const subLifePillarItem = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(subLifePillarItem).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a SubLifePillarItem', () => {
      const subLifePillarItem = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(subLifePillarItem).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a SubLifePillarItem', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of SubLifePillarItem', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a SubLifePillarItem', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addSubLifePillarItemToCollectionIfMissing', () => {
      it('should add a SubLifePillarItem to an empty array', () => {
        const subLifePillarItem: ISubLifePillarItem = sampleWithRequiredData;
        expectedResult = service.addSubLifePillarItemToCollectionIfMissing([], subLifePillarItem);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subLifePillarItem);
      });

      it('should not add a SubLifePillarItem to an array that contains it', () => {
        const subLifePillarItem: ISubLifePillarItem = sampleWithRequiredData;
        const subLifePillarItemCollection: ISubLifePillarItem[] = [
          {
            ...subLifePillarItem,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addSubLifePillarItemToCollectionIfMissing(subLifePillarItemCollection, subLifePillarItem);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a SubLifePillarItem to an array that doesn't contain it", () => {
        const subLifePillarItem: ISubLifePillarItem = sampleWithRequiredData;
        const subLifePillarItemCollection: ISubLifePillarItem[] = [sampleWithPartialData];
        expectedResult = service.addSubLifePillarItemToCollectionIfMissing(subLifePillarItemCollection, subLifePillarItem);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subLifePillarItem);
      });

      it('should add only unique SubLifePillarItem to an array', () => {
        const subLifePillarItemArray: ISubLifePillarItem[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const subLifePillarItemCollection: ISubLifePillarItem[] = [sampleWithRequiredData];
        expectedResult = service.addSubLifePillarItemToCollectionIfMissing(subLifePillarItemCollection, ...subLifePillarItemArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const subLifePillarItem: ISubLifePillarItem = sampleWithRequiredData;
        const subLifePillarItem2: ISubLifePillarItem = sampleWithPartialData;
        expectedResult = service.addSubLifePillarItemToCollectionIfMissing([], subLifePillarItem, subLifePillarItem2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subLifePillarItem);
        expect(expectedResult).toContain(subLifePillarItem2);
      });

      it('should accept null and undefined values', () => {
        const subLifePillarItem: ISubLifePillarItem = sampleWithRequiredData;
        expectedResult = service.addSubLifePillarItemToCollectionIfMissing([], null, subLifePillarItem, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subLifePillarItem);
      });

      it('should return initial array if no SubLifePillarItem is added', () => {
        const subLifePillarItemCollection: ISubLifePillarItem[] = [sampleWithRequiredData];
        expectedResult = service.addSubLifePillarItemToCollectionIfMissing(subLifePillarItemCollection, undefined, null);
        expect(expectedResult).toEqual(subLifePillarItemCollection);
      });
    });

    describe('compareSubLifePillarItem', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareSubLifePillarItem(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 7992 };
        const entity2 = null;

        const compareResult1 = service.compareSubLifePillarItem(entity1, entity2);
        const compareResult2 = service.compareSubLifePillarItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 7992 };
        const entity2 = { id: 25568 };

        const compareResult1 = service.compareSubLifePillarItem(entity1, entity2);
        const compareResult2 = service.compareSubLifePillarItem(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 7992 };
        const entity2 = { id: 7992 };

        const compareResult1 = service.compareSubLifePillarItem(entity1, entity2);
        const compareResult2 = service.compareSubLifePillarItem(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
