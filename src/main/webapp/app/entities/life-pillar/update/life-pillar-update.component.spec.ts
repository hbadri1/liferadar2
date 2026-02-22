import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { LifePillarService } from '../service/life-pillar.service';
import { ILifePillar } from '../life-pillar.model';
import { LifePillarFormService } from './life-pillar-form.service';

import { LifePillarUpdateComponent } from './life-pillar-update.component';

describe('LifePillar Management Update Component', () => {
  let comp: LifePillarUpdateComponent;
  let fixture: ComponentFixture<LifePillarUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let lifePillarFormService: LifePillarFormService;
  let lifePillarService: LifePillarService;
  let extendedUserService: ExtendedUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LifePillarUpdateComponent],
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
      .overrideTemplate(LifePillarUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(LifePillarUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    lifePillarFormService = TestBed.inject(LifePillarFormService);
    lifePillarService = TestBed.inject(LifePillarService);
    extendedUserService = TestBed.inject(ExtendedUserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call ExtendedUser query and add missing value', () => {
      const lifePillar: ILifePillar = { id: 28451 };
      const owner: IExtendedUser = { id: 26328 };
      lifePillar.owner = owner;

      const extendedUserCollection: IExtendedUser[] = [{ id: 26328 }];
      jest.spyOn(extendedUserService, 'query').mockReturnValue(of(new HttpResponse({ body: extendedUserCollection })));
      const additionalExtendedUsers = [owner];
      const expectedCollection: IExtendedUser[] = [...additionalExtendedUsers, ...extendedUserCollection];
      jest.spyOn(extendedUserService, 'addExtendedUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ lifePillar });
      comp.ngOnInit();

      expect(extendedUserService.query).toHaveBeenCalled();
      expect(extendedUserService.addExtendedUserToCollectionIfMissing).toHaveBeenCalledWith(
        extendedUserCollection,
        ...additionalExtendedUsers.map(expect.objectContaining),
      );
      expect(comp.extendedUsersSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const lifePillar: ILifePillar = { id: 28451 };
      const owner: IExtendedUser = { id: 26328 };
      lifePillar.owner = owner;

      activatedRoute.data = of({ lifePillar });
      comp.ngOnInit();

      expect(comp.extendedUsersSharedCollection).toContainEqual(owner);
      expect(comp.lifePillar).toEqual(lifePillar);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILifePillar>>();
      const lifePillar = { id: 15771 };
      jest.spyOn(lifePillarFormService, 'getLifePillar').mockReturnValue(lifePillar);
      jest.spyOn(lifePillarService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ lifePillar });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: lifePillar }));
      saveSubject.complete();

      // THEN
      expect(lifePillarFormService.getLifePillar).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(lifePillarService.update).toHaveBeenCalledWith(expect.objectContaining(lifePillar));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILifePillar>>();
      const lifePillar = { id: 15771 };
      jest.spyOn(lifePillarFormService, 'getLifePillar').mockReturnValue({ id: null });
      jest.spyOn(lifePillarService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ lifePillar: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: lifePillar }));
      saveSubject.complete();

      // THEN
      expect(lifePillarFormService.getLifePillar).toHaveBeenCalled();
      expect(lifePillarService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILifePillar>>();
      const lifePillar = { id: 15771 };
      jest.spyOn(lifePillarService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ lifePillar });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(lifePillarService.update).toHaveBeenCalled();
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
