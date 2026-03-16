import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ISubPillarItemTranslation } from '../sub-pillar-item-translation.model';
import {
  sampleWithFullData,
  sampleWithNewData,
  sampleWithPartialData,
  sampleWithRequiredData,
} from '../sub-pillar-item-translation.test-samples';

import { SubPillarItemTranslationService } from './sub-pillar-item-translation.service';

const requireRestSample: ISubPillarItemTranslation = {
  ...sampleWithRequiredData,
};

describe('SubPillarItemTranslation Service', () => {
  let service: SubPillarItemTranslationService;
  let httpMock: HttpTestingController;
  let expectedResult: ISubPillarItemTranslation | ISubPillarItemTranslation[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(SubPillarItemTranslationService);
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

    it('should create a SubPillarItemTranslation', () => {
      const subPillarItemTranslation = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(subPillarItemTranslation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a SubPillarItemTranslation', () => {
      const subPillarItemTranslation = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(subPillarItemTranslation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a SubPillarItemTranslation', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of SubPillarItemTranslation', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a SubPillarItemTranslation', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addSubPillarItemTranslationToCollectionIfMissing', () => {
      it('should add a SubPillarItemTranslation to an empty array', () => {
        const subPillarItemTranslation: ISubPillarItemTranslation = sampleWithRequiredData;
        expectedResult = service.addSubPillarItemTranslationToCollectionIfMissing([], subPillarItemTranslation);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subPillarItemTranslation);
      });

      it('should not add a SubPillarItemTranslation to an array that contains it', () => {
        const subPillarItemTranslation: ISubPillarItemTranslation = sampleWithRequiredData;
        const subPillarItemTranslationCollection: ISubPillarItemTranslation[] = [
          {
            ...subPillarItemTranslation,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addSubPillarItemTranslationToCollectionIfMissing(
          subPillarItemTranslationCollection,
          subPillarItemTranslation,
        );
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a SubPillarItemTranslation to an array that doesn't contain it", () => {
        const subPillarItemTranslation: ISubPillarItemTranslation = sampleWithRequiredData;
        const subPillarItemTranslationCollection: ISubPillarItemTranslation[] = [sampleWithPartialData];
        expectedResult = service.addSubPillarItemTranslationToCollectionIfMissing(
          subPillarItemTranslationCollection,
          subPillarItemTranslation,
        );
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subPillarItemTranslation);
      });

      it('should add only unique SubPillarItemTranslation to an array', () => {
        const subPillarItemTranslationArray: ISubPillarItemTranslation[] = [
          sampleWithRequiredData,
          sampleWithPartialData,
          sampleWithFullData,
        ];
        const subPillarItemTranslationCollection: ISubPillarItemTranslation[] = [sampleWithRequiredData];
        expectedResult = service.addSubPillarItemTranslationToCollectionIfMissing(
          subPillarItemTranslationCollection,
          ...subPillarItemTranslationArray,
        );
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const subPillarItemTranslation: ISubPillarItemTranslation = sampleWithRequiredData;
        const subPillarItemTranslation2: ISubPillarItemTranslation = sampleWithPartialData;
        expectedResult = service.addSubPillarItemTranslationToCollectionIfMissing(
          [],
          subPillarItemTranslation,
          subPillarItemTranslation2,
        );
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(subPillarItemTranslation);
        expect(expectedResult).toContain(subPillarItemTranslation2);
      });

      it('should accept null and undefined values', () => {
        const subPillarItemTranslation: ISubPillarItemTranslation = sampleWithRequiredData;
        expectedResult = service.addSubPillarItemTranslationToCollectionIfMissing([], null, subPillarItemTranslation, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(subPillarItemTranslation);
      });

      it('should return initial array if no SubPillarItemTranslation is added', () => {
        const subPillarItemTranslationCollection: ISubPillarItemTranslation[] = [sampleWithRequiredData];
        expectedResult = service.addSubPillarItemTranslationToCollectionIfMissing(
          subPillarItemTranslationCollection,
          undefined,
          null,
        );
        expect(expectedResult).toEqual(subPillarItemTranslationCollection);
      });
    });

    describe('compareSubPillarItemTranslation', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareSubPillarItemTranslation(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 28830 };
        const entity2 = null;

        const compareResult1 = service.compareSubPillarItemTranslation(entity1, entity2);
        const compareResult2 = service.compareSubPillarItemTranslation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 28830 };
        const entity2 = { id: 15570 };

        const compareResult1 = service.compareSubPillarItemTranslation(entity1, entity2);
        const compareResult2 = service.compareSubPillarItemTranslation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 28830 };
        const entity2 = { id: 28830 };

        const compareResult1 = service.compareSubPillarItemTranslation(entity1, entity2);
        const compareResult2 = service.compareSubPillarItemTranslation(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
