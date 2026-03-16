import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../pillar-translation.test-samples';

import { PillarTranslationFormService } from './pillar-translation-form.service';

describe('PillarTranslation Form Service', () => {
  let service: PillarTranslationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PillarTranslationFormService);
  });

  describe('Service methods', () => {
    describe('createPillarTranslationFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPillarTranslationFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            lang: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            pillar: expect.any(Object),
          }),
        );
      });

      it('passing IPillarTranslation should create a new form with FormGroup', () => {
        const formGroup = service.createPillarTranslationFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            lang: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            pillar: expect.any(Object),
          }),
        );
      });
    });

    describe('getPillarTranslation', () => {
      it('should return NewPillarTranslation for default PillarTranslation initial value', () => {
        const formGroup = service.createPillarTranslationFormGroup(sampleWithNewData);

        const pillarTranslation = service.getPillarTranslation(formGroup) as any;

        expect(pillarTranslation).toMatchObject(sampleWithNewData);
      });

      it('should return NewPillarTranslation for empty PillarTranslation initial value', () => {
        const formGroup = service.createPillarTranslationFormGroup();

        const pillarTranslation = service.getPillarTranslation(formGroup) as any;

        expect(pillarTranslation).toMatchObject({});
      });

      it('should return IPillarTranslation', () => {
        const formGroup = service.createPillarTranslationFormGroup(sampleWithRequiredData);

        const pillarTranslation = service.getPillarTranslation(formGroup) as any;

        expect(pillarTranslation).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPillarTranslation should not enable id FormControl', () => {
        const formGroup = service.createPillarTranslationFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPillarTranslation should disable id FormControl', () => {
        const formGroup = service.createPillarTranslationFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
