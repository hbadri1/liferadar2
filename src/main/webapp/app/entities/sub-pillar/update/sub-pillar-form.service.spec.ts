import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../sub-pillar.test-samples';

import { SubPillarFormService } from './sub-pillar-form.service';

describe('SubPillar Form Service', () => {
  let service: SubPillarFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubPillarFormService);
  });

  describe('Service methods', () => {
    describe('createSubPillarFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createSubPillarFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            isActive: expect.any(Object),
            owner: expect.any(Object),
          }),
        );
      });

      it('passing ISubPillar should create a new form with FormGroup', () => {
        const formGroup = service.createSubPillarFormGroup(sampleWithRequiredData);

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

    describe('getSubPillar', () => {
      it('should return NewSubPillar for default SubPillar initial value', () => {
        const formGroup = service.createSubPillarFormGroup(sampleWithNewData);

        const subPillar = service.getSubPillar(formGroup) as any;

        expect(subPillar).toMatchObject(sampleWithNewData);
      });

      it('should return NewSubPillar for empty SubPillar initial value', () => {
        const formGroup = service.createSubPillarFormGroup();

        const subPillar = service.getSubPillar(formGroup) as any;

        expect(subPillar).toMatchObject({});
      });

      it('should return ISubPillar', () => {
        const formGroup = service.createSubPillarFormGroup(sampleWithRequiredData);

        const subPillar = service.getSubPillar(formGroup) as any;

        expect(subPillar).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ISubPillar should not enable id FormControl', () => {
        const formGroup = service.createSubPillarFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewSubPillar should disable id FormControl', () => {
        const formGroup = service.createSubPillarFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
