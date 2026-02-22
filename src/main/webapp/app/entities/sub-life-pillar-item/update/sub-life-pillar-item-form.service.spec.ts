import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../sub-life-pillar-item.test-samples';

import { SubLifePillarItemFormService } from './sub-life-pillar-item-form.service';

describe('SubLifePillarItem Form Service', () => {
  let service: SubLifePillarItemFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubLifePillarItemFormService);
  });

  describe('Service methods', () => {
    describe('createSubLifePillarItemFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createSubLifePillarItemFormGroup();

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

      it('passing ISubLifePillarItem should create a new form with FormGroup', () => {
        const formGroup = service.createSubLifePillarItemFormGroup(sampleWithRequiredData);

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

    describe('getSubLifePillarItem', () => {
      it('should return NewSubLifePillarItem for default SubLifePillarItem initial value', () => {
        const formGroup = service.createSubLifePillarItemFormGroup(sampleWithNewData);

        const subLifePillarItem = service.getSubLifePillarItem(formGroup) as any;

        expect(subLifePillarItem).toMatchObject(sampleWithNewData);
      });

      it('should return NewSubLifePillarItem for empty SubLifePillarItem initial value', () => {
        const formGroup = service.createSubLifePillarItemFormGroup();

        const subLifePillarItem = service.getSubLifePillarItem(formGroup) as any;

        expect(subLifePillarItem).toMatchObject({});
      });

      it('should return ISubLifePillarItem', () => {
        const formGroup = service.createSubLifePillarItemFormGroup(sampleWithRequiredData);

        const subLifePillarItem = service.getSubLifePillarItem(formGroup) as any;

        expect(subLifePillarItem).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ISubLifePillarItem should not enable id FormControl', () => {
        const formGroup = service.createSubLifePillarItemFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewSubLifePillarItem should disable id FormControl', () => {
        const formGroup = service.createSubLifePillarItemFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
