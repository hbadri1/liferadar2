import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { PillarService } from '../service/pillar.service';
import { IPillar } from '../pillar.model';
import { PillarFormService } from './pillar-form.service';

import { PillarUpdateComponent } from './pillar-update.component';

describe('Pillar Management Update Component', () => {
  let comp: PillarUpdateComponent;
  let fixture: ComponentFixture<PillarUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let pillarFormService: PillarFormService;
  let pillarService: PillarService;
  let extendedUserService: ExtendedUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PillarUpdateComponent],
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
      .overrideTemplate(PillarUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PillarUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    pillarFormService = TestBed.inject(PillarFormService);
    pillarService = TestBed.inject(PillarService);
    extendedUserService = TestBed.inject(ExtendedUserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call ExtendedUser query and add missing value', () => {
      const pillar: IPillar = { id: 28451 };
      const owner: IExtendedUser = { id: 26328 };
      pillar.owner = owner;

      const extendedUserCollection: IExtendedUser[] = [{ id: 26328 }];
      jest.spyOn(extendedUserService, 'query').mockReturnValue(of(new HttpResponse({ body: extendedUserCollection })));
      const additionalExtendedUsers = [owner];
      const expectedCollection: IExtendedUser[] = [...additionalExtendedUsers, ...extendedUserCollection];
      jest.spyOn(extendedUserService, 'addExtendedUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ pillar });
      comp.ngOnInit();

      expect(extendedUserService.query).toHaveBeenCalled();
      expect(extendedUserService.addExtendedUserToCollectionIfMissing).toHaveBeenCalledWith(
        extendedUserCollection,
        ...additionalExtendedUsers.map(expect.objectContaining),
      );
      expect(comp.extendedUsersSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const pillar: IPillar = { id: 28451 };
      const owner: IExtendedUser = { id: 26328 };
      pillar.owner = owner;

      activatedRoute.data = of({ pillar });
      comp.ngOnInit();

      expect(comp.extendedUsersSharedCollection).toContainEqual(owner);
      expect(comp.pillar).toEqual(pillar);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPillar>>();
      const pillar = { id: 15771 };
      jest.spyOn(pillarFormService, 'getPillar').mockReturnValue(pillar);
      jest.spyOn(pillarService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pillar });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: pillar }));
      saveSubject.complete();

      // THEN
      expect(pillarFormService.getPillar).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(pillarService.update).toHaveBeenCalledWith(expect.objectContaining(pillar));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPillar>>();
      const pillar = { id: 15771 };
      jest.spyOn(pillarFormService, 'getPillar').mockReturnValue({ id: null });
      jest.spyOn(pillarService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pillar: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: pillar }));
      saveSubject.complete();

      // THEN
      expect(pillarFormService.getPillar).toHaveBeenCalled();
      expect(pillarService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPillar>>();
      const pillar = { id: 15771 };
      jest.spyOn(pillarService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pillar });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(pillarService.update).toHaveBeenCalled();
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
