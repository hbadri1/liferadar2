import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../sub-pillar-item.test-samples';

import { SubPillarItemFormService } from './sub-pillar-item-form.service';

describe('SubPillarItem Form Service', () => {
  let service: SubPillarItemFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubPillarItemFormService);
  });

  describe('Service methods', () => {
    describe('createSubPillarItemFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createSubPillarItemFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            sortOrder: expect.any(Object),
            isActive: expect.any(Object),
            owner: expect.any(Object),
          }),
        );
      });

      it('passing ISubPillarItem should create a new form with FormGroup', () => {
        const formGroup = service.createSubPillarItemFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            sortOrder: expect.any(Object),
            isActive: expect.any(Object),
            owner: expect.any(Object),
          }),
        );
      });
    });

    describe('getSubPillarItem', () => {
      it('should return NewSubPillarItem for default SubPillarItem initial value', () => {
        const formGroup = service.createSubPillarItemFormGroup(sampleWithNewData);

        const subPillarItem = service.getSubPillarItem(formGroup) as any;

        expect(subPillarItem).toMatchObject(sampleWithNewData);
      });

      it('should return NewSubPillarItem for empty SubPillarItem initial value', () => {
        const formGroup = service.createSubPillarItemFormGroup();

        const subPillarItem = service.getSubPillarItem(formGroup) as any;

        expect(subPillarItem).toMatchObject({});
      });

      it('should return ISubPillarItem', () => {
        const formGroup = service.createSubPillarItemFormGroup(sampleWithRequiredData);

        const subPillarItem = service.getSubPillarItem(formGroup) as any;

        expect(subPillarItem).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ISubPillarItem should not enable id FormControl', () => {
        const formGroup = service.createSubPillarItemFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewSubPillarItem should disable id FormControl', () => {
        const formGroup = service.createSubPillarItemFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
