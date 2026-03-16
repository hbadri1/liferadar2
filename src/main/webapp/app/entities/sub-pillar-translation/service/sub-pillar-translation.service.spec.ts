import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ISubPillarTranslation } from '../sub-pillar-translation.model';
import {
  sampleWithFullData,
  sampleWithNewData,
  sampleWithPartialData,
  sampleWithRequiredData,
} from '../sub-pillar-translation.test-samples';

import { SubPillarTranslationService } from './sub-pillar-translation.service';

const requireRestSample: ISubPillarTranslation = {
  ...sampleWithRequiredData,
};

describe('SubPillarTranslation Service', () => {
  let service: SubPillarTranslationService;
  let httpMock: HttpTestingController;
  let expectedResult: ISubPillarTranslation | ISubPillarTranslation[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(SubPillarTranslationService);
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

    it('should create a SubPillarTranslation', () => {
      const subPillarTranslation = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(subPillarTranslation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a SubPillarTranslation', () => {
      const subPillarTranslation = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(subPillarTranslation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a SubPillarTranslation', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of SubPillarTranslation', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a SubPillarTranslation', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addSubPillarTranslationToCollectionIfMissing', () => {
      it('should add a SubPillarTranslation to an empty array', () => {
        const subPillarTranslation: ISubPillarTranslation = sampleWithRequiredData;
        expectedResult = service.addSubPillarTranslationToCollectionIfMissing([], subPillarTranslation);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subPillarTranslation);
      });

      it('should not add a SubPillarTranslation to an array that contains it', () => {
        const subPillarTranslation: ISubPillarTranslation = sampleWithRequiredData;
        const subPillarTranslationCollection: ISubPillarTranslation[] = [
          {
            ...subPillarTranslation,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addSubPillarTranslationToCollectionIfMissing(
          subPillarTranslationCollection,
          subPillarTranslation,
        );
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a SubPillarTranslation to an array that doesn't contain it", () => {
        const subPillarTranslation: ISubPillarTranslation = sampleWithRequiredData;
        const subPillarTranslationCollection: ISubPillarTranslation[] = [sampleWithPartialData];
        expectedResult = service.addSubPillarTranslationToCollectionIfMissing(
          subPillarTranslationCollection,
          subPillarTranslation,
        );
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subPillarTranslation);
      });

      it('should add only unique SubPillarTranslation to an array', () => {
        const subPillarTranslationArray: ISubPillarTranslation[] = [
          sampleWithRequiredData,
          sampleWithPartialData,
          sampleWithFullData,
        ];
        const subPillarTranslationCollection: ISubPillarTranslation[] = [sampleWithRequiredData];
        expectedResult = service.addSubPillarTranslationToCollectionIfMissing(
          subPillarTranslationCollection,
          ...subPillarTranslationArray,
        );
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const subPillarTranslation: ISubPillarTranslation = sampleWithRequiredData;
        const subPillarTranslation2: ISubPillarTranslation = sampleWithPartialData;
        expectedResult = service.addSubPillarTranslationToCollectionIfMissing([], subPillarTranslation, subPillarTranslation2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subPillarTranslation);
        expect(expectedResult).toContain(subPillarTranslation2);
      });

      it('should accept null and undefined values', () => {
        const subPillarTranslation: ISubPillarTranslation = sampleWithRequiredData;
        expectedResult = service.addSubPillarTranslationToCollectionIfMissing([], null, subPillarTranslation, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subPillarTranslation);
      });

      it('should return initial array if no SubPillarTranslation is added', () => {
        const subPillarTranslationCollection: ISubPillarTranslation[] = [sampleWithRequiredData];
        expectedResult = service.addSubPillarTranslationToCollectionIfMissing(subPillarTranslationCollection, undefined, null);
        expect(expectedResult).toEqual(subPillarTranslationCollection);
      });
    });

    describe('compareSubPillarTranslation', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareSubPillarTranslation(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 7484 };
        const entity2 = null;

        const compareResult1 = service.compareSubPillarTranslation(entity1, entity2);
        const compareResult2 = service.compareSubPillarTranslation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 7484 };
        const entity2 = { id: 19960 };

        const compareResult1 = service.compareSubPillarTranslation(entity1, entity2);
        const compareResult2 = service.compareSubPillarTranslation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 7484 };
        const entity2 = { id: 7484 };

        const compareResult1 = service.compareSubPillarTranslation(entity1, entity2);
        const compareResult2 = service.compareSubPillarTranslation(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
