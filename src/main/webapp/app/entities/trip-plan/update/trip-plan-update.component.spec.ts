import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { TripPlanService } from '../service/trip-plan.service';
import { ITripPlan } from '../trip-plan.model';
import { TripPlanFormService } from './trip-plan-form.service';

import { TripPlanUpdateComponent } from './trip-plan-update.component';

describe('TripPlan Management Update Component', () => {
  let comp: TripPlanUpdateComponent;
  let fixture: ComponentFixture<TripPlanUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let tripPlanFormService: TripPlanFormService;
  let tripPlanService: TripPlanService;
  let extendedUserService: ExtendedUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TripPlanUpdateComponent],
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
      .overrideTemplate(TripPlanUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TripPlanUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    tripPlanFormService = TestBed.inject(TripPlanFormService);
    tripPlanService = TestBed.inject(TripPlanService);
    extendedUserService = TestBed.inject(ExtendedUserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call ExtendedUser query and add missing value', () => {
      const tripPlan: ITripPlan = { id: 19150 };
      const owner: IExtendedUser = { id: 26328 };
      tripPlan.owner = owner;

      const extendedUserCollection: IExtendedUser[] = [{ id: 26328 }];
      jest.spyOn(extendedUserService, 'query').mockReturnValue(of(new HttpResponse({ body: extendedUserCollection })));
      const additionalExtendedUsers = [owner];
      const expectedCollection: IExtendedUser[] = [...additionalExtendedUsers, ...extendedUserCollection];
      jest.spyOn(extendedUserService, 'addExtendedUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ tripPlan });
      comp.ngOnInit();

      expect(extendedUserService.query).toHaveBeenCalled();
      expect(extendedUserService.addExtendedUserToCollectionIfMissing).toHaveBeenCalledWith(
        extendedUserCollection,
        ...additionalExtendedUsers.map(expect.objectContaining),
      );
      expect(comp.extendedUsersSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const tripPlan: ITripPlan = { id: 19150 };
      const owner: IExtendedUser = { id: 26328 };
      tripPlan.owner = owner;

      activatedRoute.data = of({ tripPlan });
      comp.ngOnInit();

      expect(comp.extendedUsersSharedCollection).toContainEqual(owner);
      expect(comp.tripPlan).toEqual(tripPlan);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITripPlan>>();
      const tripPlan = { id: 11048 };
      jest.spyOn(tripPlanFormService, 'getTripPlan').mockReturnValue(tripPlan);
      jest.spyOn(tripPlanService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tripPlan });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: tripPlan }));
      saveSubject.complete();

      // THEN
      expect(tripPlanFormService.getTripPlan).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(tripPlanService.update).toHaveBeenCalledWith(expect.objectContaining(tripPlan));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITripPlan>>();
      const tripPlan = { id: 11048 };
      jest.spyOn(tripPlanFormService, 'getTripPlan').mockReturnValue({ id: null });
      jest.spyOn(tripPlanService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tripPlan: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: tripPlan }));
      saveSubject.complete();

      // THEN
      expect(tripPlanFormService.getTripPlan).toHaveBeenCalled();
      expect(tripPlanService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITripPlan>>();
      const tripPlan = { id: 11048 };
      jest.spyOn(tripPlanService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tripPlan });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(tripPlanService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareExtendedUser', () => {
      it('should forward to extendedUserService', () => {
        const entity = { id: 26328 };
        const entity2 = { id: 9654 };
        jest.spyOn(extendedUserService, 'compareExtendedUser');
        comp.compareExtendedUser(entity, entity2);
        expect(extendedUserService.compareExtendedUser).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
