import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../sub-life-pillar-item-translation.test-samples';

import { SubLifePillarItemTranslationFormService } from './sub-life-pillar-item-translation-form.service';

describe('SubLifePillarItemTranslation Form Service', () => {
  let service: SubLifePillarItemTranslationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubLifePillarItemTranslationFormService);
  });

  describe('Service methods', () => {
    describe('createSubLifePillarItemTranslationFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createSubLifePillarItemTranslationFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            lang: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            subLifePillarItem: expect.any(Object),
          }),
        );
      });

      it('passing ISubLifePillarItemTranslation should create a new form with FormGroup', () => {
        const formGroup = service.createSubLifePillarItemTranslationFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            lang: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            subLifePillarItem: expect.any(Object),
          }),
        );
      });
    });

    describe('getSubLifePillarItemTranslation', () => {
      it('should return NewSubLifePillarItemTranslation for default SubLifePillarItemTranslation initial value', () => {
        const formGroup = service.createSubLifePillarItemTranslationFormGroup(sampleWithNewData);

        const subLifePillarItemTranslation = service.getSubLifePillarItemTranslation(formGroup) as any;

        expect(subLifePillarItemTranslation).toMatchObject(sampleWithNewData);
      });

      it('should return NewSubLifePillarItemTranslation for empty SubLifePillarItemTranslation initial value', () => {
        const formGroup = service.createSubLifePillarItemTranslationFormGroup();

        const subLifePillarItemTranslation = service.getSubLifePillarItemTranslation(formGroup) as any;

        expect(subLifePillarItemTranslation).toMatchObject({});
      });

      it('should return ISubLifePillarItemTranslation', () => {
        const formGroup = service.createSubLifePillarItemTranslationFormGroup(sampleWithRequiredData);

        const subLifePillarItemTranslation = service.getSubLifePillarItemTranslation(formGroup) as any;

        expect(subLifePillarItemTranslation).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ISubLifePillarItemTranslation should not enable id FormControl', () => {
        const formGroup = service.createSubLifePillarItemTranslationFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewSubLifePillarItemTranslation should disable id FormControl', () => {
        const formGroup = service.createSubLifePillarItemTranslationFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
