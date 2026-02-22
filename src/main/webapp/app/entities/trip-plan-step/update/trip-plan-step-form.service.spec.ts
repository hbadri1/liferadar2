import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../trip-plan-step.test-samples';

import { TripPlanStepFormService } from './trip-plan-step-form.service';

describe('TripPlanStep Form Service', () => {
  let service: TripPlanStepFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TripPlanStepFormService);
  });

  describe('Service methods', () => {
    describe('createTripPlanStepFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTripPlanStepFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            actionName: expect.any(Object),
            sequence: expect.any(Object),
            notes: expect.any(Object),
            tripPlan: expect.any(Object),
          }),
        );
      });

      it('passing ITripPlanStep should create a new form with FormGroup', () => {
        const formGroup = service.createTripPlanStepFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            actionName: expect.any(Object),
            sequence: expect.any(Object),
            notes: expect.any(Object),
            tripPlan: expect.any(Object),
          }),
        );
      });
    });

    describe('getTripPlanStep', () => {
      it('should return NewTripPlanStep for default TripPlanStep initial value', () => {
        const formGroup = service.createTripPlanStepFormGroup(sampleWithNewData);

        const tripPlanStep = service.getTripPlanStep(formGroup) as any;

        expect(tripPlanStep).toMatchObject(sampleWithNewData);
      });

      it('should return NewTripPlanStep for empty TripPlanStep initial value', () => {
        const formGroup = service.createTripPlanStepFormGroup();

        const tripPlanStep = service.getTripPlanStep(formGroup) as any;

        expect(tripPlanStep).toMatchObject({});
      });

      it('should return ITripPlanStep', () => {
        const formGroup = service.createTripPlanStepFormGroup(sampleWithRequiredData);

        const tripPlanStep = service.getTripPlanStep(formGroup) as any;

        expect(tripPlanStep).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITripPlanStep should not enable id FormControl', () => {
        const formGroup = service.createTripPlanStepFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTripPlanStep should disable id FormControl', () => {
        const formGroup = service.createTripPlanStepFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
