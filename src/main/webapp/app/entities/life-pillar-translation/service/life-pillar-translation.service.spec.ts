import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ILifePillarTranslation } from '../life-pillar-translation.model';
import {
  sampleWithFullData,
  sampleWithNewData,
  sampleWithPartialData,
  sampleWithRequiredData,
} from '../life-pillar-translation.test-samples';

import { LifePillarTranslationService } from './life-pillar-translation.service';

const requireRestSample: ILifePillarTranslation = {
  ...sampleWithRequiredData,
};

describe('LifePillarTranslation Service', () => {
  let service: LifePillarTranslationService;
  let httpMock: HttpTestingController;
  let expectedResult: ILifePillarTranslation | ILifePillarTranslation[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(LifePillarTranslationService);
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

    it('should create a LifePillarTranslation', () => {
      const lifePillarTranslation = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(lifePillarTranslation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a LifePillarTranslation', () => {
      const lifePillarTranslation = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(lifePillarTranslation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a LifePillarTranslation', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of LifePillarTranslation', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a LifePillarTranslation', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addLifePillarTranslationToCollectionIfMissing', () => {
      it('should add a LifePillarTranslation to an empty array', () => {
        const lifePillarTranslation: ILifePillarTranslation = sampleWithRequiredData;
        expectedResult = service.addLifePillarTranslationToCollectionIfMissing([], lifePillarTranslation);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(lifePillarTranslation);
      });

      it('should not add a LifePillarTranslation to an array that contains it', () => {
        const lifePillarTranslation: ILifePillarTranslation = sampleWithRequiredData;
        const lifePillarTranslationCollection: ILifePillarTranslation[] = [
          {
            ...lifePillarTranslation,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addLifePillarTranslationToCollectionIfMissing(lifePillarTranslationCollection, lifePillarTranslation);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a LifePillarTranslation to an array that doesn't contain it", () => {
        const lifePillarTranslation: ILifePillarTranslation = sampleWithRequiredData;
        const lifePillarTranslationCollection: ILifePillarTranslation[] = [sampleWithPartialData];
        expectedResult = service.addLifePillarTranslationToCollectionIfMissing(lifePillarTranslationCollection, lifePillarTranslation);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(lifePillarTranslation);
      });

      it('should add only unique LifePillarTranslation to an array', () => {
        const lifePillarTranslationArray: ILifePillarTranslation[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const lifePillarTranslationCollection: ILifePillarTranslation[] = [sampleWithRequiredData];
        expectedResult = service.addLifePillarTranslationToCollectionIfMissing(
          lifePillarTranslationCollection,
          ...lifePillarTranslationArray,
        );
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const lifePillarTranslation: ILifePillarTranslation = sampleWithRequiredData;
        const lifePillarTranslation2: ILifePillarTranslation = sampleWithPartialData;
        expectedResult = service.addLifePillarTranslationToCollectionIfMissing([], lifePillarTranslation, lifePillarTranslation2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(lifePillarTranslation);
        expect(expectedResult).toContain(lifePillarTranslation2);
      });

      it('should accept null and undefined values', () => {
        const lifePillarTranslation: ILifePillarTranslation = sampleWithRequiredData;
        expectedResult = service.addLifePillarTranslationToCollectionIfMissing([], null, lifePillarTranslation, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(lifePillarTranslation);
      });

      it('should return initial array if no LifePillarTranslation is added', () => {
        const lifePillarTranslationCollection: ILifePillarTranslation[] = [sampleWithRequiredData];
        expectedResult = service.addLifePillarTranslationToCollectionIfMissing(lifePillarTranslationCollection, undefined, null);
        expect(expectedResult).toEqual(lifePillarTranslationCollection);
      });
    });

    describe('compareLifePillarTranslation', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareLifePillarTranslation(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 22644 };
        const entity2 = null;

        const compareResult1 = service.compareLifePillarTranslation(entity1, entity2);
        const compareResult2 = service.compareLifePillarTranslation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 22644 };
        const entity2 = { id: 23537 };

        const compareResult1 = service.compareLifePillarTranslation(entity1, entity2);
        const compareResult2 = service.compareLifePillarTranslation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 22644 };
        const entity2 = { id: 22644 };

        const compareResult1 = service.compareLifePillarTranslation(entity1, entity2);
        const compareResult2 = service.compareLifePillarTranslation(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
