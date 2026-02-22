import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ISubLifePillarTranslation } from '../sub-life-pillar-translation.model';
import {
  sampleWithFullData,
  sampleWithNewData,
  sampleWithPartialData,
  sampleWithRequiredData,
} from '../sub-life-pillar-translation.test-samples';

import { SubLifePillarTranslationService } from './sub-life-pillar-translation.service';

const requireRestSample: ISubLifePillarTranslation = {
  ...sampleWithRequiredData,
};

describe('SubLifePillarTranslation Service', () => {
  let service: SubLifePillarTranslationService;
  let httpMock: HttpTestingController;
  let expectedResult: ISubLifePillarTranslation | ISubLifePillarTranslation[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(SubLifePillarTranslationService);
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

    it('should create a SubLifePillarTranslation', () => {
      const subLifePillarTranslation = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(subLifePillarTranslation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a SubLifePillarTranslation', () => {
      const subLifePillarTranslation = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(subLifePillarTranslation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a SubLifePillarTranslation', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of SubLifePillarTranslation', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a SubLifePillarTranslation', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addSubLifePillarTranslationToCollectionIfMissing', () => {
      it('should add a SubLifePillarTranslation to an empty array', () => {
        const subLifePillarTranslation: ISubLifePillarTranslation = sampleWithRequiredData;
        expectedResult = service.addSubLifePillarTranslationToCollectionIfMissing([], subLifePillarTranslation);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subLifePillarTranslation);
      });

      it('should not add a SubLifePillarTranslation to an array that contains it', () => {
        const subLifePillarTranslation: ISubLifePillarTranslation = sampleWithRequiredData;
        const subLifePillarTranslationCollection: ISubLifePillarTranslation[] = [
          {
            ...subLifePillarTranslation,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addSubLifePillarTranslationToCollectionIfMissing(
          subLifePillarTranslationCollection,
          subLifePillarTranslation,
        );
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a SubLifePillarTranslation to an array that doesn't contain it", () => {
        const subLifePillarTranslation: ISubLifePillarTranslation = sampleWithRequiredData;
        const subLifePillarTranslationCollection: ISubLifePillarTranslation[] = [sampleWithPartialData];
        expectedResult = service.addSubLifePillarTranslationToCollectionIfMissing(
          subLifePillarTranslationCollection,
          subLifePillarTranslation,
        );
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subLifePillarTranslation);
      });

      it('should add only unique SubLifePillarTranslation to an array', () => {
        const subLifePillarTranslationArray: ISubLifePillarTranslation[] = [
          sampleWithRequiredData,
          sampleWithPartialData,
          sampleWithFullData,
        ];
        const subLifePillarTranslationCollection: ISubLifePillarTranslation[] = [sampleWithRequiredData];
        expectedResult = service.addSubLifePillarTranslationToCollectionIfMissing(
          subLifePillarTranslationCollection,
          ...subLifePillarTranslationArray,
        );
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const subLifePillarTranslation: ISubLifePillarTranslation = sampleWithRequiredData;
        const subLifePillarTranslation2: ISubLifePillarTranslation = sampleWithPartialData;
        expectedResult = service.addSubLifePillarTranslationToCollectionIfMissing([], subLifePillarTranslation, subLifePillarTranslation2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subLifePillarTranslation);
        expect(expectedResult).toContain(subLifePillarTranslation2);
      });

      it('should accept null and undefined values', () => {
        const subLifePillarTranslation: ISubLifePillarTranslation = sampleWithRequiredData;
        expectedResult = service.addSubLifePillarTranslationToCollectionIfMissing([], null, subLifePillarTranslation, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subLifePillarTranslation);
      });

      it('should return initial array if no SubLifePillarTranslation is added', () => {
        const subLifePillarTranslationCollection: ISubLifePillarTranslation[] = [sampleWithRequiredData];
        expectedResult = service.addSubLifePillarTranslationToCollectionIfMissing(subLifePillarTranslationCollection, undefined, null);
        expect(expectedResult).toEqual(subLifePillarTranslationCollection);
      });
    });

    describe('compareSubLifePillarTranslation', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareSubLifePillarTranslation(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 7484 };
        const entity2 = null;

        const compareResult1 = service.compareSubLifePillarTranslation(entity1, entity2);
        const compareResult2 = service.compareSubLifePillarTranslation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 7484 };
        const entity2 = { id: 19960 };

        const compareResult1 = service.compareSubLifePillarTranslation(entity1, entity2);
        const compareResult2 = service.compareSubLifePillarTranslation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 7484 };
        const entity2 = { id: 7484 };

        const compareResult1 = service.compareSubLifePillarTranslation(entity1, entity2);
        const compareResult2 = service.compareSubLifePillarTranslation(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
