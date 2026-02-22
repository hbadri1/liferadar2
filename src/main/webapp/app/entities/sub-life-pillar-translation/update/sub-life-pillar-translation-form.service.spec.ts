import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../sub-life-pillar-translation.test-samples';

import { SubLifePillarTranslationFormService } from './sub-life-pillar-translation-form.service';

describe('SubLifePillarTranslation Form Service', () => {
  let service: SubLifePillarTranslationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubLifePillarTranslationFormService);
  });

  describe('Service methods', () => {
    describe('createSubLifePillarTranslationFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createSubLifePillarTranslationFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            lang: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            subLifePillar: expect.any(Object),
          }),
        );
      });

      it('passing ISubLifePillarTranslation should create a new form with FormGroup', () => {
        const formGroup = service.createSubLifePillarTranslationFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            lang: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            subLifePillar: expect.any(Object),
          }),
        );
      });
    });

    describe('getSubLifePillarTranslation', () => {
      it('should return NewSubLifePillarTranslation for default SubLifePillarTranslation initial value', () => {
        const formGroup = service.createSubLifePillarTranslationFormGroup(sampleWithNewData);

        const subLifePillarTranslation = service.getSubLifePillarTranslation(formGroup) as any;

        expect(subLifePillarTranslation).toMatchObject(sampleWithNewData);
      });

      it('should return NewSubLifePillarTranslation for empty SubLifePillarTranslation initial value', () => {
        const formGroup = service.createSubLifePillarTranslationFormGroup();

        const subLifePillarTranslation = service.getSubLifePillarTranslation(formGroup) as any;

        expect(subLifePillarTranslation).toMatchObject({});
      });

      it('should return ISubLifePillarTranslation', () => {
        const formGroup = service.createSubLifePillarTranslationFormGroup(sampleWithRequiredData);

        const subLifePillarTranslation = service.getSubLifePillarTranslation(formGroup) as any;

        expect(subLifePillarTranslation).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ISubLifePillarTranslation should not enable id FormControl', () => {
        const formGroup = service.createSubLifePillarTranslationFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewSubLifePillarTranslation should disable id FormControl', () => {
        const formGroup = service.createSubLifePillarTranslationFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
