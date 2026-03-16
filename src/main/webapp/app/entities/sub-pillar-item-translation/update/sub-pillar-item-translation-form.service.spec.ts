import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../sub-pillar-item-translation.test-samples';

import { SubPillarItemTranslationFormService } from './sub-pillar-item-translation-form.service';

describe('SubPillarItemTranslation Form Service', () => {
  let service: SubPillarItemTranslationFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubPillarItemTranslationFormService);
  });

  describe('Service methods', () => {
    describe('createSubPillarItemTranslationFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createSubPillarItemTranslationFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            lang: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            subPillarItem: expect.any(Object),
          }),
        );
      });

      it('passing ISubPillarItemTranslation should create a new form with FormGroup', () => {
        const formGroup = service.createSubPillarItemTranslationFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            lang: expect.any(Object),
            name: expect.any(Object),
            description: expect.any(Object),
            subPillarItem: expect.any(Object),
          }),
        );
      });
    });

    describe('getSubPillarItemTranslation', () => {
      it('should return NewSubPillarItemTranslation for default SubPillarItemTranslation initial value', () => {
        const formGroup = service.createSubPillarItemTranslationFormGroup(sampleWithNewData);

        const subPillarItemTranslation = service.getSubPillarItemTranslation(formGroup) as any;

        expect(subPillarItemTranslation).toMatchObject(sampleWithNewData);
      });

      it('should return NewSubPillarItemTranslation for empty SubPillarItemTranslation initial value', () => {
        const formGroup = service.createSubPillarItemTranslationFormGroup();

        const subPillarItemTranslation = service.getSubPillarItemTranslation(formGroup) as any;

        expect(subPillarItemTranslation).toMatchObject({});
      });

      it('should return ISubPillarItemTranslation', () => {
        const formGroup = service.createSubPillarItemTranslationFormGroup(sampleWithRequiredData);

        const subPillarItemTranslation = service.getSubPillarItemTranslation(formGroup) as any;

        expect(subPillarItemTranslation).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ISubPillarItemTranslation should not enable id FormControl', () => {
        const formGroup = service.createSubPillarItemTranslationFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewSubPillarItemTranslation should disable id FormControl', () => {
        const formGroup = service.createSubPillarItemTranslationFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
