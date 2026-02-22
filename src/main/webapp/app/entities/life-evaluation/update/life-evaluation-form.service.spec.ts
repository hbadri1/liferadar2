import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../life-evaluation.test-samples';

import { LifeEvaluationFormService } from './life-evaluation-form.service';

describe('LifeEvaluation Form Service', () => {
  let service: LifeEvaluationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LifeEvaluationFormService);
  });

  describe('Service methods', () => {
    describe('createLifeEvaluationFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createLifeEvaluationFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            evaluationDate: expect.any(Object),
            reminderEnabled: expect.any(Object),
            reminderAt: expect.any(Object),
            score: expect.any(Object),
            notes: expect.any(Object),
            owner: expect.any(Object),
            subLifePillarItem: expect.any(Object),
          }),
        );
      });

      it('passing ILifeEvaluation should create a new form with FormGroup', () => {
        const formGroup = service.createLifeEvaluationFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            evaluationDate: expect.any(Object),
            reminderEnabled: expect.any(Object),
            reminderAt: expect.any(Object),
            score: expect.any(Object),
            notes: expect.any(Object),
            owner: expect.any(Object),
            subLifePillarItem: expect.any(Object),
          }),
        );
      });
    });

    describe('getLifeEvaluation', () => {
      it('should return NewLifeEvaluation for default LifeEvaluation initial value', () => {
        const formGroup = service.createLifeEvaluationFormGroup(sampleWithNewData);

        const lifeEvaluation = service.getLifeEvaluation(formGroup) as any;

        expect(lifeEvaluation).toMatchObject(sampleWithNewData);
      });

      it('should return NewLifeEvaluation for empty LifeEvaluation initial value', () => {
        const formGroup = service.createLifeEvaluationFormGroup();

        const lifeEvaluation = service.getLifeEvaluation(formGroup) as any;

        expect(lifeEvaluation).toMatchObject({});
      });

      it('should return ILifeEvaluation', () => {
        const formGroup = service.createLifeEvaluationFormGroup(sampleWithRequiredData);

        const lifeEvaluation = service.getLifeEvaluation(formGroup) as any;

        expect(lifeEvaluation).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ILifeEvaluation should not enable id FormControl', () => {
        const formGroup = service.createLifeEvaluationFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewLifeEvaluation should disable id FormControl', () => {
        const formGroup = service.createLifeEvaluationFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
