import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ISubLifePillar } from '../sub-life-pillar.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../sub-life-pillar.test-samples';

import { SubLifePillarService } from './sub-life-pillar.service';

const requireRestSample: ISubLifePillar = {
  ...sampleWithRequiredData,
};

describe('SubLifePillar Service', () => {
  let service: SubLifePillarService;
  let httpMock: HttpTestingController;
  let expectedResult: ISubLifePillar | ISubLifePillar[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(SubLifePillarService);
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

    it('should create a SubLifePillar', () => {
      const subLifePillar = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(subLifePillar).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a SubLifePillar', () => {
      const subLifePillar = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(subLifePillar).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a SubLifePillar', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of SubLifePillar', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a SubLifePillar', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addSubLifePillarToCollectionIfMissing', () => {
      it('should add a SubLifePillar to an empty array', () => {
        const subLifePillar: ISubLifePillar = sampleWithRequiredData;
        expectedResult = service.addSubLifePillarToCollectionIfMissing([], subLifePillar);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subLifePillar);
      });

      it('should not add a SubLifePillar to an array that contains it', () => {
        const subLifePillar: ISubLifePillar = sampleWithRequiredData;
        const subLifePillarCollection: ISubLifePillar[] = [
          {
            ...subLifePillar,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addSubLifePillarToCollectionIfMissing(subLifePillarCollection, subLifePillar);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a SubLifePillar to an array that doesn't contain it", () => {
        const subLifePillar: ISubLifePillar = sampleWithRequiredData;
        const subLifePillarCollection: ISubLifePillar[] = [sampleWithPartialData];
        expectedResult = service.addSubLifePillarToCollectionIfMissing(subLifePillarCollection, subLifePillar);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subLifePillar);
      });

      it('should add only unique SubLifePillar to an array', () => {
        const subLifePillarArray: ISubLifePillar[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const subLifePillarCollection: ISubLifePillar[] = [sampleWithRequiredData];
        expectedResult = service.addSubLifePillarToCollectionIfMissing(subLifePillarCollection, ...subLifePillarArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const subLifePillar: ISubLifePillar = sampleWithRequiredData;
        const subLifePillar2: ISubLifePillar = sampleWithPartialData;
        expectedResult = service.addSubLifePillarToCollectionIfMissing([], subLifePillar, subLifePillar2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subLifePillar);
        expect(expectedResult).toContain(subLifePillar2);
      });

      it('should accept null and undefined values', () => {
        const subLifePillar: ISubLifePillar = sampleWithRequiredData;
        expectedResult = service.addSubLifePillarToCollectionIfMissing([], null, subLifePillar, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subLifePillar);
      });

      it('should return initial array if no SubLifePillar is added', () => {
        const subLifePillarCollection: ISubLifePillar[] = [sampleWithRequiredData];
        expectedResult = service.addSubLifePillarToCollectionIfMissing(subLifePillarCollection, undefined, null);
        expect(expectedResult).toEqual(subLifePillarCollection);
      });
    });

    describe('compareSubLifePillar', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareSubLifePillar(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 23772 };
        const entity2 = null;

        const compareResult1 = service.compareSubLifePillar(entity1, entity2);
        const compareResult2 = service.compareSubLifePillar(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 23772 };
        const entity2 = { id: 13923 };

        const compareResult1 = service.compareSubLifePillar(entity1, entity2);
        const compareResult2 = service.compareSubLifePillar(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 23772 };
        const entity2 = { id: 23772 };

        const compareResult1 = service.compareSubLifePillar(entity1, entity2);
        const compareResult2 = service.compareSubLifePillar(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
