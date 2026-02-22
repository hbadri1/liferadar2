import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../life-pillar.test-samples';

import { LifePillarFormService } from './life-pillar-form.service';

describe('LifePillar Form Service', () => {
  let service: LifePillarFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LifePillarFormService);
  });

  describe('Service methods', () => {
    describe('createLifePillarFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createLifePillarFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            isActive: expect.any(Object),
            owner: expect.any(Object),
          }),
        );
      });

      it('passing ILifePillar should create a new form with FormGroup', () => {
        const formGroup = service.createLifePillarFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            isActive: expect.any(Object),
            owner: expect.any(Object),
          }),
        );
      });
    });

    describe('getLifePillar', () => {
      it('should return NewLifePillar for default LifePillar initial value', () => {
        const formGroup = service.createLifePillarFormGroup(sampleWithNewData);

        const lifePillar = service.getLifePillar(formGroup) as any;

        expect(lifePillar).toMatchObject(sampleWithNewData);
      });

      it('should return NewLifePillar for empty LifePillar initial value', () => {
        const formGroup = service.createLifePillarFormGroup();

        const lifePillar = service.getLifePillar(formGroup) as any;

        expect(lifePillar).toMatchObject({});
      });

      it('should return ILifePillar', () => {
        const formGroup = service.createLifePillarFormGroup(sampleWithRequiredData);

        const lifePillar = service.getLifePillar(formGroup) as any;

        expect(lifePillar).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ILifePillar should not enable id FormControl', () => {
        const formGroup = service.createLifePillarFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewLifePillar should disable id FormControl', () => {
        const formGroup = service.createLifePillarFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
