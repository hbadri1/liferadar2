import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IPillarTranslation } from '../pillar-translation.model';
import {
  sampleWithFullData,
  sampleWithNewData,
  sampleWithPartialData,
  sampleWithRequiredData,
} from '../pillar-translation.test-samples';

import { PillarTranslationService } from './pillar-translation.service';

const requireRestSample: IPillarTranslation = {
  ...sampleWithRequiredData,
};

describe('PillarTranslation Service', () => {
  let service: PillarTranslationService;
  let httpMock: HttpTestingController;
  let expectedResult: IPillarTranslation | IPillarTranslation[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PillarTranslationService);
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

    it('should create a PillarTranslation', () => {
      const pillarTranslation = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(pillarTranslation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PillarTranslation', () => {
      const pillarTranslation = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(pillarTranslation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PillarTranslation', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PillarTranslation', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PillarTranslation', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPillarTranslationToCollectionIfMissing', () => {
      it('should add a PillarTranslation to an empty array', () => {
        const pillarTranslation: IPillarTranslation = sampleWithRequiredData;
        expectedResult = service.addPillarTranslationToCollectionIfMissing([], pillarTranslation);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(pillarTranslation);
      });

      it('should not add a PillarTranslation to an array that contains it', () => {
        const pillarTranslation: IPillarTranslation = sampleWithRequiredData;
        const pillarTranslationCollection: IPillarTranslation[] = [
          {
            ...pillarTranslation,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPillarTranslationToCollectionIfMissing(pillarTranslationCollection, pillarTranslation);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PillarTranslation to an array that doesn't contain it", () => {
        const pillarTranslation: IPillarTranslation = sampleWithRequiredData;
        const pillarTranslationCollection: IPillarTranslation[] = [sampleWithPartialData];
        expectedResult = service.addPillarTranslationToCollectionIfMissing(pillarTranslationCollection, pillarTranslation);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(pillarTranslation);
      });

      it('should add only unique PillarTranslation to an array', () => {
        const pillarTranslationArray: IPillarTranslation[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const pillarTranslationCollection: IPillarTranslation[] = [sampleWithRequiredData];
        expectedResult = service.addPillarTranslationToCollectionIfMissing(
          pillarTranslationCollection,
          ...pillarTranslationArray,
        );
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const pillarTranslation: IPillarTranslation = sampleWithRequiredData;
        const pillarTranslation2: IPillarTranslation = sampleWithPartialData;
        expectedResult = service.addPillarTranslationToCollectionIfMissing([], pillarTranslation, pillarTranslation2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(pillarTranslation);
        expect(expectedResult).toContain(pillarTranslation2);
      });

      it('should accept null and undefined values', () => {
        const pillarTranslation: IPillarTranslation = sampleWithRequiredData;
        expectedResult = service.addPillarTranslationToCollectionIfMissing([], null, pillarTranslation, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(pillarTranslation);
      });

      it('should return initial array if no PillarTranslation is added', () => {
        const pillarTranslationCollection: IPillarTranslation[] = [sampleWithRequiredData];
        expectedResult = service.addPillarTranslationToCollectionIfMissing(pillarTranslationCollection, undefined, null);
        expect(expectedResult).toEqual(pillarTranslationCollection);
      });
    });

    describe('comparePillarTranslation', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePillarTranslation(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 22644 };
        const entity2 = null;

        const compareResult1 = service.comparePillarTranslation(entity1, entity2);
        const compareResult2 = service.comparePillarTranslation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 22644 };
        const entity2 = { id: 23537 };

        const compareResult1 = service.comparePillarTranslation(entity1, entity2);
        const compareResult2 = service.comparePillarTranslation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 22644 };
        const entity2 = { id: 22644 };

        const compareResult1 = service.comparePillarTranslation(entity1, entity2);
        const compareResult2 = service.comparePillarTranslation(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
