import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ILifePillar } from '../life-pillar.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../life-pillar.test-samples';

import { LifePillarService } from './life-pillar.service';

const requireRestSample: ILifePillar = {
  ...sampleWithRequiredData,
};

describe('LifePillar Service', () => {
  let service: LifePillarService;
  let httpMock: HttpTestingController;
  let expectedResult: ILifePillar | ILifePillar[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(LifePillarService);
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

    it('should create a LifePillar', () => {
      const lifePillar = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(lifePillar).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a LifePillar', () => {
      const lifePillar = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(lifePillar).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a LifePillar', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of LifePillar', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a LifePillar', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addLifePillarToCollectionIfMissing', () => {
      it('should add a LifePillar to an empty array', () => {
        const lifePillar: ILifePillar = sampleWithRequiredData;
        expectedResult = service.addLifePillarToCollectionIfMissing([], lifePillar);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(lifePillar);
      });

      it('should not add a LifePillar to an array that contains it', () => {
        const lifePillar: ILifePillar = sampleWithRequiredData;
        const lifePillarCollection: ILifePillar[] = [
          {
            ...lifePillar,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addLifePillarToCollectionIfMissing(lifePillarCollection, lifePillar);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a LifePillar to an array that doesn't contain it", () => {
        const lifePillar: ILifePillar = sampleWithRequiredData;
        const lifePillarCollection: ILifePillar[] = [sampleWithPartialData];
        expectedResult = service.addLifePillarToCollectionIfMissing(lifePillarCollection, lifePillar);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(lifePillar);
      });

      it('should add only unique LifePillar to an array', () => {
        const lifePillarArray: ILifePillar[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const lifePillarCollection: ILifePillar[] = [sampleWithRequiredData];
        expectedResult = service.addLifePillarToCollectionIfMissing(lifePillarCollection, ...lifePillarArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const lifePillar: ILifePillar = sampleWithRequiredData;
        const lifePillar2: ILifePillar = sampleWithPartialData;
        expectedResult = service.addLifePillarToCollectionIfMissing([], lifePillar, lifePillar2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(lifePillar);
        expect(expectedResult).toContain(lifePillar2);
      });

      it('should accept null and undefined values', () => {
        const lifePillar: ILifePillar = sampleWithRequiredData;
        expectedResult = service.addLifePillarToCollectionIfMissing([], null, lifePillar, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(lifePillar);
      });

      it('should return initial array if no LifePillar is added', () => {
        const lifePillarCollection: ILifePillar[] = [sampleWithRequiredData];
        expectedResult = service.addLifePillarToCollectionIfMissing(lifePillarCollection, undefined, null);
        expect(expectedResult).toEqual(lifePillarCollection);
      });
    });

    describe('compareLifePillar', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareLifePillar(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 15771 };
        const entity2 = null;

        const compareResult1 = service.compareLifePillar(entity1, entity2);
        const compareResult2 = service.compareLifePillar(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 15771 };
        const entity2 = { id: 28451 };

        const compareResult1 = service.compareLifePillar(entity1, entity2);
        const compareResult2 = service.compareLifePillar(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 15771 };
        const entity2 = { id: 15771 };

        const compareResult1 = service.compareLifePillar(entity1, entity2);
        const compareResult2 = service.compareLifePillar(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
