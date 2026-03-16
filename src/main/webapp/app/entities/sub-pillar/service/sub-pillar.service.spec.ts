import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ISubPillar } from '../sub-pillar.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../sub-pillar.test-samples';

import { SubPillarService } from './sub-pillar.service';

const requireRestSample: ISubPillar = {
  ...sampleWithRequiredData,
};

describe('SubPillar Service', () => {
  let service: SubPillarService;
  let httpMock: HttpTestingController;
  let expectedResult: ISubPillar | ISubPillar[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(SubPillarService);
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

    it('should create a SubPillar', () => {
      const subPillar = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(subPillar).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a SubPillar', () => {
      const subPillar = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(subPillar).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a SubPillar', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of SubPillar', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a SubPillar', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addSubPillarToCollectionIfMissing', () => {
      it('should add a SubPillar to an empty array', () => {
        const subPillar: ISubPillar = sampleWithRequiredData;
        expectedResult = service.addSubPillarToCollectionIfMissing([], subPillar);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subPillar);
      });

      it('should not add a SubPillar to an array that contains it', () => {
        const subPillar: ISubPillar = sampleWithRequiredData;
        const subPillarCollection: ISubPillar[] = [
          {
            ...subPillar,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addSubPillarToCollectionIfMissing(subPillarCollection, subPillar);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a SubPillar to an array that doesn't contain it", () => {
        const subPillar: ISubPillar = sampleWithRequiredData;
        const subPillarCollection: ISubPillar[] = [sampleWithPartialData];
        expectedResult = service.addSubPillarToCollectionIfMissing(subPillarCollection, subPillar);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subPillar);
      });

      it('should add only unique SubPillar to an array', () => {
        const subPillarArray: ISubPillar[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const subPillarCollection: ISubPillar[] = [sampleWithRequiredData];
        expectedResult = service.addSubPillarToCollectionIfMissing(subPillarCollection, ...subPillarArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const subPillar: ISubPillar = sampleWithRequiredData;
        const subPillar2: ISubPillar = sampleWithPartialData;
        expectedResult = service.addSubPillarToCollectionIfMissing([], subPillar, subPillar2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subPillar);
        expect(expectedResult).toContain(subPillar2);
      });

      it('should accept null and undefined values', () => {
        const subPillar: ISubPillar = sampleWithRequiredData;
        expectedResult = service.addSubPillarToCollectionIfMissing([], null, subPillar, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subPillar);
      });

      it('should return initial array if no SubPillar is added', () => {
        const subPillarCollection: ISubPillar[] = [sampleWithRequiredData];
        expectedResult = service.addSubPillarToCollectionIfMissing(subPillarCollection, undefined, null);
        expect(expectedResult).toEqual(subPillarCollection);
      });
    });

    describe('compareSubPillar', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareSubPillar(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 23772 };
        const entity2 = null;

        const compareResult1 = service.compareSubPillar(entity1, entity2);
        const compareResult2 = service.compareSubPillar(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 23772 };
        const entity2 = { id: 13923 };

        const compareResult1 = service.compareSubPillar(entity1, entity2);
        const compareResult2 = service.compareSubPillar(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 23772 };
        const entity2 = { id: 23772 };

        const compareResult1 = service.compareSubPillar(entity1, entity2);
        const compareResult2 = service.compareSubPillar(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
