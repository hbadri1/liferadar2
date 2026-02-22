import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ITripPlan } from 'app/entities/trip-plan/trip-plan.model';
import { TripPlanService } from 'app/entities/trip-plan/service/trip-plan.service';
import { TripPlanStepService } from '../service/trip-plan-step.service';
import { ITripPlanStep } from '../trip-plan-step.model';
import { TripPlanStepFormService } from './trip-plan-step-form.service';

import { TripPlanStepUpdateComponent } from './trip-plan-step-update.component';

describe('TripPlanStep Management Update Component', () => {
  let comp: TripPlanStepUpdateComponent;
  let fixture: ComponentFixture<TripPlanStepUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let tripPlanStepFormService: TripPlanStepFormService;
  let tripPlanStepService: TripPlanStepService;
  let tripPlanService: TripPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TripPlanStepUpdateComponent],
      providers: [
        provideHttpClient(),
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(TripPlanStepUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TripPlanStepUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    tripPlanStepFormService = TestBed.inject(TripPlanStepFormService);
    tripPlanStepService = TestBed.inject(TripPlanStepService);
    tripPlanService = TestBed.inject(TripPlanService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call TripPlan query and add missing value', () => {
      const tripPlanStep: ITripPlanStep = { id: 13307 };
      const tripPlan: ITripPlan = { id: 11048 };
      tripPlanStep.tripPlan = tripPlan;

      const tripPlanCollection: ITripPlan[] = [{ id: 11048 }];
      jest.spyOn(tripPlanService, 'query').mockReturnValue(of(new HttpResponse({ body: tripPlanCollection })));
      const additionalTripPlans = [tripPlan];
      const expectedCollection: ITripPlan[] = [...additionalTripPlans, ...tripPlanCollection];
      jest.spyOn(tripPlanService, 'addTripPlanToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ tripPlanStep });
      comp.ngOnInit();

      expect(tripPlanService.query).toHaveBeenCalled();
      expect(tripPlanService.addTripPlanToCollectionIfMissing).toHaveBeenCalledWith(
        tripPlanCollection,
        ...additionalTripPlans.map(expect.objectContaining),
      );
      expect(comp.tripPlansSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const tripPlanStep: ITripPlanStep = { id: 13307 };
      const tripPlan: ITripPlan = { id: 11048 };
      tripPlanStep.tripPlan = tripPlan;

      activatedRoute.data = of({ tripPlanStep });
      comp.ngOnInit();

      expect(comp.tripPlansSharedCollection).toContainEqual(tripPlan);
      expect(comp.tripPlanStep).toEqual(tripPlanStep);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITripPlanStep>>();
      const tripPlanStep = { id: 5952 };
      jest.spyOn(tripPlanStepFormService, 'getTripPlanStep').mockReturnValue(tripPlanStep);
      jest.spyOn(tripPlanStepService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tripPlanStep });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: tripPlanStep }));
      saveSubject.complete();

      // THEN
      expect(tripPlanStepFormService.getTripPlanStep).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(tripPlanStepService.update).toHaveBeenCalledWith(expect.objectContaining(tripPlanStep));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITripPlanStep>>();
      const tripPlanStep = { id: 5952 };
      jest.spyOn(tripPlanStepFormService, 'getTripPlanStep').mockReturnValue({ id: null });
      jest.spyOn(tripPlanStepService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tripPlanStep: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: tripPlanStep }));
      saveSubject.complete();

      // THEN
      expect(tripPlanStepFormService.getTripPlanStep).toHaveBeenCalled();
      expect(tripPlanStepService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITripPlanStep>>();
      const tripPlanStep = { id: 5952 };
      jest.spyOn(tripPlanStepService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tripPlanStep });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(tripPlanStepService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareTripPlan', () => {
      it('should forward to tripPlanService', () => {
        const entity = { id: 11048 };
        const entity2 = { id: 19150 };
        jest.spyOn(tripPlanService, 'compareTripPlan');
        comp.compareTripPlan(entity, entity2);
        expect(tripPlanService.compareTripPlan).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
