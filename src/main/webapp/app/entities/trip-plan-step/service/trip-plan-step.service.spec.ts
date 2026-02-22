import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ITripPlanStep } from '../trip-plan-step.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../trip-plan-step.test-samples';

import { RestTripPlanStep, TripPlanStepService } from './trip-plan-step.service';

const requireRestSample: RestTripPlanStep = {
  ...sampleWithRequiredData,
  startDate: sampleWithRequiredData.startDate?.format(DATE_FORMAT),
  endDate: sampleWithRequiredData.endDate?.format(DATE_FORMAT),
};

describe('TripPlanStep Service', () => {
  let service: TripPlanStepService;
  let httpMock: HttpTestingController;
  let expectedResult: ITripPlanStep | ITripPlanStep[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TripPlanStepService);
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

    it('should create a TripPlanStep', () => {
      const tripPlanStep = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(tripPlanStep).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TripPlanStep', () => {
      const tripPlanStep = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(tripPlanStep).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TripPlanStep', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TripPlanStep', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a TripPlanStep', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTripPlanStepToCollectionIfMissing', () => {
      it('should add a TripPlanStep to an empty array', () => {
        const tripPlanStep: ITripPlanStep = sampleWithRequiredData;
        expectedResult = service.addTripPlanStepToCollectionIfMissing([], tripPlanStep);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(tripPlanStep);
      });

      it('should not add a TripPlanStep to an array that contains it', () => {
        const tripPlanStep: ITripPlanStep = sampleWithRequiredData;
        const tripPlanStepCollection: ITripPlanStep[] = [
          {
            ...tripPlanStep,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTripPlanStepToCollectionIfMissing(tripPlanStepCollection, tripPlanStep);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TripPlanStep to an array that doesn't contain it", () => {
        const tripPlanStep: ITripPlanStep = sampleWithRequiredData;
        const tripPlanStepCollection: ITripPlanStep[] = [sampleWithPartialData];
        expectedResult = service.addTripPlanStepToCollectionIfMissing(tripPlanStepCollection, tripPlanStep);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(tripPlanStep);
      });

      it('should add only unique TripPlanStep to an array', () => {
        const tripPlanStepArray: ITripPlanStep[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const tripPlanStepCollection: ITripPlanStep[] = [sampleWithRequiredData];
        expectedResult = service.addTripPlanStepToCollectionIfMissing(tripPlanStepCollection, ...tripPlanStepArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const tripPlanStep: ITripPlanStep = sampleWithRequiredData;
        const tripPlanStep2: ITripPlanStep = sampleWithPartialData;
        expectedResult = service.addTripPlanStepToCollectionIfMissing([], tripPlanStep, tripPlanStep2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(tripPlanStep);
        expect(expectedResult).toContain(tripPlanStep2);
      });

      it('should accept null and undefined values', () => {
        const tripPlanStep: ITripPlanStep = sampleWithRequiredData;
        expectedResult = service.addTripPlanStepToCollectionIfMissing([], null, tripPlanStep, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(tripPlanStep);
      });

      it('should return initial array if no TripPlanStep is added', () => {
        const tripPlanStepCollection: ITripPlanStep[] = [sampleWithRequiredData];
        expectedResult = service.addTripPlanStepToCollectionIfMissing(tripPlanStepCollection, undefined, null);
        expect(expectedResult).toEqual(tripPlanStepCollection);
      });
    });

    describe('compareTripPlanStep', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTripPlanStep(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 5952 };
        const entity2 = null;

        const compareResult1 = service.compareTripPlanStep(entity1, entity2);
        const compareResult2 = service.compareTripPlanStep(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 5952 };
        const entity2 = { id: 13307 };

        const compareResult1 = service.compareTripPlanStep(entity1, entity2);
        const compareResult2 = service.compareTripPlanStep(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 5952 };
        const entity2 = { id: 5952 };

        const compareResult1 = service.compareTripPlanStep(entity1, entity2);
        const compareResult2 = service.compareTripPlanStep(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
