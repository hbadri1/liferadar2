import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ITripPlan } from '../trip-plan.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../trip-plan.test-samples';

import { RestTripPlan, TripPlanService } from './trip-plan.service';

const requireRestSample: RestTripPlan = {
  ...sampleWithRequiredData,
  startDate: sampleWithRequiredData.startDate?.format(DATE_FORMAT),
  endDate: sampleWithRequiredData.endDate?.format(DATE_FORMAT),
};

describe('TripPlan Service', () => {
  let service: TripPlanService;
  let httpMock: HttpTestingController;
  let expectedResult: ITripPlan | ITripPlan[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TripPlanService);
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

    it('should create a TripPlan', () => {
      const tripPlan = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(tripPlan).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TripPlan', () => {
      const tripPlan = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(tripPlan).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TripPlan', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TripPlan', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a TripPlan', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTripPlanToCollectionIfMissing', () => {
      it('should add a TripPlan to an empty array', () => {
        const tripPlan: ITripPlan = sampleWithRequiredData;
        expectedResult = service.addTripPlanToCollectionIfMissing([], tripPlan);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(tripPlan);
      });

      it('should not add a TripPlan to an array that contains it', () => {
        const tripPlan: ITripPlan = sampleWithRequiredData;
        const tripPlanCollection: ITripPlan[] = [
          {
            ...tripPlan,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTripPlanToCollectionIfMissing(tripPlanCollection, tripPlan);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TripPlan to an array that doesn't contain it", () => {
        const tripPlan: ITripPlan = sampleWithRequiredData;
        const tripPlanCollection: ITripPlan[] = [sampleWithPartialData];
        expectedResult = service.addTripPlanToCollectionIfMissing(tripPlanCollection, tripPlan);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(tripPlan);
      });

      it('should add only unique TripPlan to an array', () => {
        const tripPlanArray: ITripPlan[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const tripPlanCollection: ITripPlan[] = [sampleWithRequiredData];
        expectedResult = service.addTripPlanToCollectionIfMissing(tripPlanCollection, ...tripPlanArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const tripPlan: ITripPlan = sampleWithRequiredData;
        const tripPlan2: ITripPlan = sampleWithPartialData;
        expectedResult = service.addTripPlanToCollectionIfMissing([], tripPlan, tripPlan2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(tripPlan);
        expect(expectedResult).toContain(tripPlan2);
      });

      it('should accept null and undefined values', () => {
        const tripPlan: ITripPlan = sampleWithRequiredData;
        expectedResult = service.addTripPlanToCollectionIfMissing([], null, tripPlan, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(tripPlan);
      });

      it('should return initial array if no TripPlan is added', () => {
        const tripPlanCollection: ITripPlan[] = [sampleWithRequiredData];
        expectedResult = service.addTripPlanToCollectionIfMissing(tripPlanCollection, undefined, null);
        expect(expectedResult).toEqual(tripPlanCollection);
      });
    });

    describe('compareTripPlan', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTripPlan(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 11048 };
        const entity2 = null;

        const compareResult1 = service.compareTripPlan(entity1, entity2);
        const compareResult2 = service.compareTripPlan(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 11048 };
        const entity2 = { id: 19150 };

        const compareResult1 = service.compareTripPlan(entity1, entity2);
        const compareResult2 = service.compareTripPlan(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 11048 };
        const entity2 = { id: 11048 };

        const compareResult1 = service.compareTripPlan(entity1, entity2);
        const compareResult2 = service.compareTripPlan(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
