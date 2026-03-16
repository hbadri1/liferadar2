import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IPillar } from '../pillar.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../pillar.test-samples';

import { PillarService } from './pillar.service';

const requireRestSample: IPillar = {
  ...sampleWithRequiredData,
};

describe('Pillar Service', () => {
  let service: PillarService;
  let httpMock: HttpTestingController;
  let expectedResult: IPillar | IPillar[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PillarService);
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

    it('should create a Pillar', () => {
      const pillar = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(pillar).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Pillar', () => {
      const pillar = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(pillar).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Pillar', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Pillar', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Pillar', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPillarToCollectionIfMissing', () => {
      it('should add a Pillar to an empty array', () => {
        const pillar: IPillar = sampleWithRequiredData;
        expectedResult = service.addPillarToCollectionIfMissing([], pillar);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(pillar);
      });

      it('should not add a Pillar to an array that contains it', () => {
        const pillar: IPillar = sampleWithRequiredData;
        const pillarCollection: IPillar[] = [
          {
            ...pillar,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPillarToCollectionIfMissing(pillarCollection, pillar);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Pillar to an array that doesn't contain it", () => {
        const pillar: IPillar = sampleWithRequiredData;
        const pillarCollection: IPillar[] = [sampleWithPartialData];
        expectedResult = service.addPillarToCollectionIfMissing(pillarCollection, pillar);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(pillar);
      });

      it('should add only unique Pillar to an array', () => {
        const pillarArray: IPillar[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const pillarCollection: IPillar[] = [sampleWithRequiredData];
        expectedResult = service.addPillarToCollectionIfMissing(pillarCollection, ...pillarArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const pillar: IPillar = sampleWithRequiredData;
        const pillar2: IPillar = sampleWithPartialData;
        expectedResult = service.addPillarToCollectionIfMissing([], pillar, pillar2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(pillar);
        expect(expectedResult).toContain(pillar2);
      });

      it('should accept null and undefined values', () => {
        const pillar: IPillar = sampleWithRequiredData;
        expectedResult = service.addPillarToCollectionIfMissing([], null, pillar, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(pillar);
      });

      it('should return initial array if no Pillar is added', () => {
        const pillarCollection: IPillar[] = [sampleWithRequiredData];
        expectedResult = service.addPillarToCollectionIfMissing(pillarCollection, undefined, null);
        expect(expectedResult).toEqual(pillarCollection);
      });
    });

    describe('comparePillar', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePillar(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 15771 };
        const entity2 = null;

        const compareResult1 = service.comparePillar(entity1, entity2);
        const compareResult2 = service.comparePillar(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 15771 };
        const entity2 = { id: 28451 };

        const compareResult1 = service.comparePillar(entity1, entity2);
        const compareResult2 = service.comparePillar(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 15771 };
        const entity2 = { id: 15771 };

        const compareResult1 = service.comparePillar(entity1, entity2);
        const compareResult2 = service.comparePillar(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
