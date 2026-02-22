import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../trip-plan.test-samples';

import { TripPlanFormService } from './trip-plan-form.service';

describe('TripPlan Form Service', () => {
  let service: TripPlanFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripPlanFormService);
  });

  describe('Service methods', () => {
    describe('createTripPlanFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTripPlanFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            description: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            owner: expect.any(Object),
          }),
        );
      });

      it('passing ITripPlan should create a new form with FormGroup', () => {
        const formGroup = service.createTripPlanFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            description: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            owner: expect.any(Object),
          }),
        );
      });
    });

    describe('getTripPlan', () => {
      it('should return NewTripPlan for default TripPlan initial value', () => {
        const formGroup = service.createTripPlanFormGroup(sampleWithNewData);

        const tripPlan = service.getTripPlan(formGroup) as any;

        expect(tripPlan).toMatchObject(sampleWithNewData);
      });

      it('should return NewTripPlan for empty TripPlan initial value', () => {
        const formGroup = service.createTripPlanFormGroup();

        const tripPlan = service.getTripPlan(formGroup) as any;

        expect(tripPlan).toMatchObject({});
      });

      it('should return ITripPlan', () => {
        const formGroup = service.createTripPlanFormGroup(sampleWithRequiredData);

        const tripPlan = service.getTripPlan(formGroup) as any;

        expect(tripPlan).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITripPlan should not enable id FormControl', () => {
        const formGroup = service.createTripPlanFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTripPlan should disable id FormControl', () => {
        const formGroup = service.createTripPlanFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
