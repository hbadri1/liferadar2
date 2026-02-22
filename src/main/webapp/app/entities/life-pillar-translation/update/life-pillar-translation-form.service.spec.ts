import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../life-pillar-translation.test-samples';

import { LifePillarTranslationFormService } from './life-pillar-translation-form.service';

describe('LifePillarTranslation Form Service', () => {
  let service: LifePillarTranslationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LifePillarTranslationFormService);
  });

  describe('Service methods', () => {
    describe('createLifePillarTranslationFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createLifePillarTranslationFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            lang: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            lifePillar: expect.any(Object),
          }),
        );
      });

      it('passing ILifePillarTranslation should create a new form with FormGroup', () => {
        const formGroup = service.createLifePillarTranslationFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            lang: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            lifePillar: expect.any(Object),
          }),
        );
      });
    });

    describe('getLifePillarTranslation', () => {
      it('should return NewLifePillarTranslation for default LifePillarTranslation initial value', () => {
        const formGroup = service.createLifePillarTranslationFormGroup(sampleWithNewData);

        const lifePillarTranslation = service.getLifePillarTranslation(formGroup) as any;

        expect(lifePillarTranslation).toMatchObject(sampleWithNewData);
      });

      it('should return NewLifePillarTranslation for empty LifePillarTranslation initial value', () => {
        const formGroup = service.createLifePillarTranslationFormGroup();

        const lifePillarTranslation = service.getLifePillarTranslation(formGroup) as any;

        expect(lifePillarTranslation).toMatchObject({});
      });

      it('should return ILifePillarTranslation', () => {
        const formGroup = service.createLifePillarTranslationFormGroup(sampleWithRequiredData);

        const lifePillarTranslation = service.getLifePillarTranslation(formGroup) as any;

        expect(lifePillarTranslation).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ILifePillarTranslation should not enable id FormControl', () => {
        const formGroup = service.createLifePillarTranslationFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewLifePillarTranslation should disable id FormControl', () => {
        const formGroup = service.createLifePillarTranslationFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
