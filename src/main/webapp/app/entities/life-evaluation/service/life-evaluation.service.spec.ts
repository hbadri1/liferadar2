import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ILifeEvaluation } from '../life-evaluation.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../life-evaluation.test-samples';

import { LifeEvaluationService, RestLifeEvaluation } from './life-evaluation.service';

const requireRestSample: RestLifeEvaluation = {
  ...sampleWithRequiredData,
  evaluationDate: sampleWithRequiredData.evaluationDate?.format(DATE_FORMAT),
  reminderAt: sampleWithRequiredData.reminderAt?.toJSON(),
};

describe('LifeEvaluation Service', () => {
  let service: LifeEvaluationService;
  let httpMock: HttpTestingController;
  let expectedResult: ILifeEvaluation | ILifeEvaluation[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(LifeEvaluationService);
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

    it('should create a LifeEvaluation', () => {
      const lifeEvaluation = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(lifeEvaluation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a LifeEvaluation', () => {
      const lifeEvaluation = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(lifeEvaluation).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a LifeEvaluation', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of LifeEvaluation', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a LifeEvaluation', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addLifeEvaluationToCollectionIfMissing', () => {
      it('should add a LifeEvaluation to an empty array', () => {
        const lifeEvaluation: ILifeEvaluation = sampleWithRequiredData;
        expectedResult = service.addLifeEvaluationToCollectionIfMissing([], lifeEvaluation);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(lifeEvaluation);
      });

      it('should not add a LifeEvaluation to an array that contains it', () => {
        const lifeEvaluation: ILifeEvaluation = sampleWithRequiredData;
        const lifeEvaluationCollection: ILifeEvaluation[] = [
          {
            ...lifeEvaluation,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addLifeEvaluationToCollectionIfMissing(lifeEvaluationCollection, lifeEvaluation);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a LifeEvaluation to an array that doesn't contain it", () => {
        const lifeEvaluation: ILifeEvaluation = sampleWithRequiredData;
        const lifeEvaluationCollection: ILifeEvaluation[] = [sampleWithPartialData];
        expectedResult = service.addLifeEvaluationToCollectionIfMissing(lifeEvaluationCollection, lifeEvaluation);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(lifeEvaluation);
      });

      it('should add only unique LifeEvaluation to an array', () => {
        const lifeEvaluationArray: ILifeEvaluation[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const lifeEvaluationCollection: ILifeEvaluation[] = [sampleWithRequiredData];
        expectedResult = service.addLifeEvaluationToCollectionIfMissing(lifeEvaluationCollection, ...lifeEvaluationArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const lifeEvaluation: ILifeEvaluation = sampleWithRequiredData;
        const lifeEvaluation2: ILifeEvaluation = sampleWithPartialData;
        expectedResult = service.addLifeEvaluationToCollectionIfMissing([], lifeEvaluation, lifeEvaluation2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(lifeEvaluation);
        expect(expectedResult).toContain(lifeEvaluation2);
      });

      it('should accept null and undefined values', () => {
        const lifeEvaluation: ILifeEvaluation = sampleWithRequiredData;
        expectedResult = service.addLifeEvaluationToCollectionIfMissing([], null, lifeEvaluation, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(lifeEvaluation);
      });

      it('should return initial array if no LifeEvaluation is added', () => {
        const lifeEvaluationCollection: ILifeEvaluation[] = [sampleWithRequiredData];
        expectedResult = service.addLifeEvaluationToCollectionIfMissing(lifeEvaluationCollection, undefined, null);
        expect(expectedResult).toEqual(lifeEvaluationCollection);
      });
    });

    describe('compareLifeEvaluation', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareLifeEvaluation(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 11329 };
        const entity2 = null;

        const compareResult1 = service.compareLifeEvaluation(entity1, entity2);
        const compareResult2 = service.compareLifeEvaluation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 11329 };
        const entity2 = { id: 27366 };

        const compareResult1 = service.compareLifeEvaluation(entity1, entity2);
        const compareResult2 = service.compareLifeEvaluation(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 11329 };
        const entity2 = { id: 11329 };

        const compareResult1 = service.compareLifeEvaluation(entity1, entity2);
        const compareResult2 = service.compareLifeEvaluation(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
