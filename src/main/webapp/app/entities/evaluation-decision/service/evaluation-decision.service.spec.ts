import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IEvaluationDecision } from '../evaluation-decision.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../evaluation-decision.test-samples';

import { EvaluationDecisionService, RestEvaluationDecision } from './evaluation-decision.service';

const requireRestSample: RestEvaluationDecision = {
  ...sampleWithRequiredData,
  date: sampleWithRequiredData.date?.toJSON(),
};

describe('EvaluationDecision Service', () => {
  let service: EvaluationDecisionService;
  let httpMock: HttpTestingController;
  let expectedResult: IEvaluationDecision | IEvaluationDecision[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(EvaluationDecisionService);
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

    it('should create a EvaluationDecision', () => {
      const evaluationDecision = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(evaluationDecision).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a EvaluationDecision', () => {
      const evaluationDecision = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(evaluationDecision).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a EvaluationDecision', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of EvaluationDecision', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a EvaluationDecision', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addEvaluationDecisionToCollectionIfMissing', () => {
      it('should add a EvaluationDecision to an empty array', () => {
        const evaluationDecision: IEvaluationDecision = sampleWithRequiredData;
        expectedResult = service.addEvaluationDecisionToCollectionIfMissing([], evaluationDecision);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(evaluationDecision);
      });

      it('should not add a EvaluationDecision to an array that contains it', () => {
        const evaluationDecision: IEvaluationDecision = sampleWithRequiredData;
        const evaluationDecisionCollection: IEvaluationDecision[] = [
          {
            ...evaluationDecision,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addEvaluationDecisionToCollectionIfMissing(evaluationDecisionCollection, evaluationDecision);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a EvaluationDecision to an array that doesn't contain it", () => {
        const evaluationDecision: IEvaluationDecision = sampleWithRequiredData;
        const evaluationDecisionCollection: IEvaluationDecision[] = [sampleWithPartialData];
        expectedResult = service.addEvaluationDecisionToCollectionIfMissing(evaluationDecisionCollection, evaluationDecision);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(evaluationDecision);
      });

      it('should add only unique EvaluationDecision to an array', () => {
        const evaluationDecisionArray: IEvaluationDecision[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const evaluationDecisionCollection: IEvaluationDecision[] = [sampleWithRequiredData];
        expectedResult = service.addEvaluationDecisionToCollectionIfMissing(evaluationDecisionCollection, ...evaluationDecisionArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const evaluationDecision: IEvaluationDecision = sampleWithRequiredData;
        const evaluationDecision2: IEvaluationDecision = sampleWithPartialData;
        expectedResult = service.addEvaluationDecisionToCollectionIfMissing([], evaluationDecision, evaluationDecision2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(evaluationDecision);
        expect(expectedResult).toContain(evaluationDecision2);
      });

      it('should accept null and undefined values', () => {
        const evaluationDecision: IEvaluationDecision = sampleWithRequiredData;
        expectedResult = service.addEvaluationDecisionToCollectionIfMissing([], null, evaluationDecision, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(evaluationDecision);
      });

      it('should return initial array if no EvaluationDecision is added', () => {
        const evaluationDecisionCollection: IEvaluationDecision[] = [sampleWithRequiredData];
        expectedResult = service.addEvaluationDecisionToCollectionIfMissing(evaluationDecisionCollection, undefined, null);
        expect(expectedResult).toEqual(evaluationDecisionCollection);
      });
    });

    describe('compareEvaluationDecision', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareEvaluationDecision(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 25936 };
        const entity2 = null;

        const compareResult1 = service.compareEvaluationDecision(entity1, entity2);
        const compareResult2 = service.compareEvaluationDecision(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 25936 };
        const entity2 = { id: 11812 };

        const compareResult1 = service.compareEvaluationDecision(entity1, entity2);
        const compareResult2 = service.compareEvaluationDecision(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 25936 };
        const entity2 = { id: 25936 };

        const compareResult1 = service.compareEvaluationDecision(entity1, entity2);
        const compareResult2 = service.compareEvaluationDecision(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
