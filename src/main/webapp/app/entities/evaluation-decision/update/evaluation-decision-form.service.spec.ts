import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../evaluation-decision.test-samples';

import { EvaluationDecisionFormService } from './evaluation-decision-form.service';

describe('EvaluationDecision Form Service', () => {
  let service: EvaluationDecisionFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvaluationDecisionFormService);
  });

  describe('Service methods', () => {
    describe('createEvaluationDecisionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createEvaluationDecisionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            decision: expect.any(Object),
            date: expect.any(Object),
            owner: expect.any(Object),
            lifeEvaluation: expect.any(Object),
          }),
        );
      });

      it('passing IEvaluationDecision should create a new form with FormGroup', () => {
        const formGroup = service.createEvaluationDecisionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            decision: expect.any(Object),
            date: expect.any(Object),
            owner: expect.any(Object),
            lifeEvaluation: expect.any(Object),
          }),
        );
      });
    });

    describe('getEvaluationDecision', () => {
      it('should return NewEvaluationDecision for default EvaluationDecision initial value', () => {
        const formGroup = service.createEvaluationDecisionFormGroup(sampleWithNewData);

        const evaluationDecision = service.getEvaluationDecision(formGroup) as any;

        expect(evaluationDecision).toMatchObject(sampleWithNewData);
      });

      it('should return NewEvaluationDecision for empty EvaluationDecision initial value', () => {
        const formGroup = service.createEvaluationDecisionFormGroup();

        const evaluationDecision = service.getEvaluationDecision(formGroup) as any;

        expect(evaluationDecision).toMatchObject({});
      });

      it('should return IEvaluationDecision', () => {
        const formGroup = service.createEvaluationDecisionFormGroup(sampleWithRequiredData);

        const evaluationDecision = service.getEvaluationDecision(formGroup) as any;

        expect(evaluationDecision).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IEvaluationDecision should not enable id FormControl', () => {
        const formGroup = service.createEvaluationDecisionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewEvaluationDecision should disable id FormControl', () => {
        const formGroup = service.createEvaluationDecisionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
