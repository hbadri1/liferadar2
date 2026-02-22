import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ISubLifePillarItemTranslation } from '../sub-life-pillar-item-translation.model';
import {
  sampleWithFullData,
  sampleWithNewData,
  sampleWithPartialData,
  sampleWithRequiredData,
} from '../sub-life-pillar-item-translation.test-samples';

import { SubLifePillarItemTranslationService } from './sub-life-pillar-item-translation.service';

const requireRestSample: ISubLifePillarItemTranslation = {
  ...sampleWithRequiredData,
};

describe('SubLifePillarItemTranslation Service', () => {
  let service: SubLifePillarItemTranslationService;
  let httpMock: HttpTestingController;
  let expectedResult: ISubLifePillarItemTranslation | ISubLifePillarItemTranslation[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(SubLifePillarItemTranslationService);
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

    it('should create a SubLifePillarItemTranslation', () => {
      const subLifePillarItemTranslation = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(subLifePillarItemTranslation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a SubLifePillarItemTranslation', () => {
      const subLifePillarItemTranslation = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(subLifePillarItemTranslation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a SubLifePillarItemTranslation', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of SubLifePillarItemTranslation', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a SubLifePillarItemTranslation', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addSubLifePillarItemTranslationToCollectionIfMissing', () => {
      it('should add a SubLifePillarItemTranslation to an empty array', () => {
        const subLifePillarItemTranslation: ISubLifePillarItemTranslation = sampleWithRequiredData;
        expectedResult = service.addSubLifePillarItemTranslationToCollectionIfMissing([], subLifePillarItemTranslation);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subLifePillarItemTranslation);
      });

      it('should not add a SubLifePillarItemTranslation to an array that contains it', () => {
        const subLifePillarItemTranslation: ISubLifePillarItemTranslation = sampleWithRequiredData;
        const subLifePillarItemTranslationCollection: ISubLifePillarItemTranslation[] = [
          {
            ...subLifePillarItemTranslation,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addSubLifePillarItemTranslationToCollectionIfMissing(
          subLifePillarItemTranslationCollection,
          subLifePillarItemTranslation,
        );
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a SubLifePillarItemTranslation to an array that doesn't contain it", () => {
        const subLifePillarItemTranslation: ISubLifePillarItemTranslation = sampleWithRequiredData;
        const subLifePillarItemTranslationCollection: ISubLifePillarItemTranslation[] = [sampleWithPartialData];
        expectedResult = service.addSubLifePillarItemTranslationToCollectionIfMissing(
          subLifePillarItemTranslationCollection,
          subLifePillarItemTranslation,
        );
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subLifePillarItemTranslation);
      });

      it('should add only unique SubLifePillarItemTranslation to an array', () => {
        const subLifePillarItemTranslationArray: ISubLifePillarItemTranslation[] = [
          sampleWithRequiredData,
          sampleWithPartialData,
          sampleWithFullData,
        ];
        const subLifePillarItemTranslationCollection: ISubLifePillarItemTranslation[] = [sampleWithRequiredData];
        expectedResult = service.addSubLifePillarItemTranslationToCollectionIfMissing(
          subLifePillarItemTranslationCollection,
          ...subLifePillarItemTranslationArray,
        );
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const subLifePillarItemTranslation: ISubLifePillarItemTranslation = sampleWithRequiredData;
        const subLifePillarItemTranslation2: ISubLifePillarItemTranslation = sampleWithPartialData;
        expectedResult = service.addSubLifePillarItemTranslationToCollectionIfMissing(
          [],
          subLifePillarItemTranslation,
          subLifePillarItemTranslation2,
        );
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subLifePillarItemTranslation);
        expect(expectedResult).toContain(subLifePillarItemTranslation2);
      });

      it('should accept null and undefined values', () => {
        const subLifePillarItemTranslation: ISubLifePillarItemTranslation = sampleWithRequiredData;
        expectedResult = service.addSubLifePillarItemTranslationToCollectionIfMissing([], null, subLifePillarItemTranslation, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subLifePillarItemTranslation);
      });

      it('should return initial array if no SubLifePillarItemTranslation is added', () => {
        const subLifePillarItemTranslationCollection: ISubLifePillarItemTranslation[] = [sampleWithRequiredData];
        expectedResult = service.addSubLifePillarItemTranslationToCollectionIfMissing(
          subLifePillarItemTranslationCollection,
          undefined,
          null,
        );
        expect(expectedResult).toEqual(subLifePillarItemTranslationCollection);
      });
    });

    describe('compareSubLifePillarItemTranslation', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareSubLifePillarItemTranslation(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 28830 };
        const entity2 = null;

        const compareResult1 = service.compareSubLifePillarItemTranslation(entity1, entity2);
        const compareResult2 = service.compareSubLifePillarItemTranslation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 28830 };
        const entity2 = { id: 15570 };

        const compareResult1 = service.compareSubLifePillarItemTranslation(entity1, entity2);
        const compareResult2 = service.compareSubLifePillarItemTranslation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 28830 };
        const entity2 = { id: 28830 };

        const compareResult1 = service.compareSubLifePillarItemTranslation(entity1, entity2);
        const compareResult2 = service.compareSubLifePillarItemTranslation(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
