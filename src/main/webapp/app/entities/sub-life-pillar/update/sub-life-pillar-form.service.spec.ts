import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../sub-life-pillar.test-samples';

import { SubLifePillarFormService } from './sub-life-pillar-form.service';

describe('SubLifePillar Form Service', () => {
  let service: SubLifePillarFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubLifePillarFormService);
  });

  describe('Service methods', () => {
    describe('createSubLifePillarFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createSubLifePillarFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            isActive: expect.any(Object),
            owner: expect.any(Object),
          }),
        );
      });

      it('passing ISubLifePillar should create a new form with FormGroup', () => {
        const formGroup = service.createSubLifePillarFormGroup(sampleWithRequiredData);

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

    describe('getSubLifePillar', () => {
      it('should return NewSubLifePillar for default SubLifePillar initial value', () => {
        const formGroup = service.createSubLifePillarFormGroup(sampleWithNewData);

        const subLifePillar = service.getSubLifePillar(formGroup) as any;

        expect(subLifePillar).toMatchObject(sampleWithNewData);
      });

      it('should return NewSubLifePillar for empty SubLifePillar initial value', () => {
        const formGroup = service.createSubLifePillarFormGroup();

        const subLifePillar = service.getSubLifePillar(formGroup) as any;

        expect(subLifePillar).toMatchObject({});
      });

      it('should return ISubLifePillar', () => {
        const formGroup = service.createSubLifePillarFormGroup(sampleWithRequiredData);

        const subLifePillar = service.getSubLifePillar(formGroup) as any;

        expect(subLifePillar).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ISubLifePillar should not enable id FormControl', () => {
        const formGroup = service.createSubLifePillarFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewSubLifePillar should disable id FormControl', () => {
        const formGroup = service.createSubLifePillarFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
