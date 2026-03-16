import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../sub-pillar-translation.test-samples';

import { SubPillarTranslationFormService } from './sub-pillar-translation-form.service';

describe('SubPillarTranslation Form Service', () => {
  let service: SubPillarTranslationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubPillarTranslationFormService);
  });

  describe('Service methods', () => {
    describe('createSubPillarTranslationFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createSubPillarTranslationFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            lang: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            subPillar: expect.any(Object),
          }),
        );
      });

      it('passing ISubPillarTranslation should create a new form with FormGroup', () => {
        const formGroup = service.createSubPillarTranslationFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            lang: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            subPillar: expect.any(Object),
          }),
        );
      });
    });

    describe('getSubPillarTranslation', () => {
      it('should return NewSubPillarTranslation for default SubPillarTranslation initial value', () => {
        const formGroup = service.createSubPillarTranslationFormGroup(sampleWithNewData);

        const subPillarTranslation = service.getSubPillarTranslation(formGroup) as any;

        expect(subPillarTranslation).toMatchObject(sampleWithNewData);
      });

      it('should return NewSubPillarTranslation for empty SubPillarTranslation initial value', () => {
        const formGroup = service.createSubPillarTranslationFormGroup();

        const subPillarTranslation = service.getSubPillarTranslation(formGroup) as any;

        expect(subPillarTranslation).toMatchObject({});
      });

      it('should return ISubPillarTranslation', () => {
        const formGroup = service.createSubPillarTranslationFormGroup(sampleWithRequiredData);

        const subPillarTranslation = service.getSubPillarTranslation(formGroup) as any;

        expect(subPillarTranslation).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ISubPillarTranslation should not enable id FormControl', () => {
        const formGroup = service.createSubPillarTranslationFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewSubPillarTranslation should disable id FormControl', () => {
        const formGroup = service.createSubPillarTranslationFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
