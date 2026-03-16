import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../pillar.test-samples';

import { PillarFormService } from './pillar-form.service';

describe('Pillar Form Service', () => {
  let service: PillarFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PillarFormService);
  });

  describe('Service methods', () => {
    describe('createPillarFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPillarFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            isActive: expect.any(Object),
            owner: expect.any(Object),
          }),
        );
      });

      it('passing IPillar should create a new form with FormGroup', () => {
        const formGroup = service.createPillarFormGroup(sampleWithRequiredData);

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

    describe('getPillar', () => {
      it('should return NewPillar for default Pillar initial value', () => {
        const formGroup = service.createPillarFormGroup(sampleWithNewData);

        const pillar = service.getPillar(formGroup) as any;

        expect(pillar).toMatchObject(sampleWithNewData);
      });

      it('should return NewPillar for empty Pillar initial value', () => {
        const formGroup = service.createPillarFormGroup();

        const pillar = service.getPillar(formGroup) as any;

        expect(pillar).toMatchObject({});
      });

      it('should return IPillar', () => {
        const formGroup = service.createPillarFormGroup(sampleWithRequiredData);

        const pillar = service.getPillar(formGroup) as any;

        expect(pillar).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPillar should not enable id FormControl', () => {
        const formGroup = service.createPillarFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPillar should disable id FormControl', () => {
        const formGroup = service.createPillarFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
