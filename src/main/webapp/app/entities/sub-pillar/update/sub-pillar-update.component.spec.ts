import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { SubPillarService } from '../service/sub-pillar.service';
import { ISubPillar } from '../sub-pillar.model';
import { SubPillarFormService } from './sub-pillar-form.service';

import { SubPillarUpdateComponent } from './sub-pillar-update.component';

describe('SubPillar Management Update Component', () => {
  let comp: SubPillarUpdateComponent;
  let fixture: ComponentFixture<SubPillarUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let subPillarFormService: SubPillarFormService;
  let subPillarService: SubPillarService;
  let extendedUserService: ExtendedUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubPillarUpdateComponent],
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
      .overrideTemplate(SubPillarUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SubPillarUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    subPillarFormService = TestBed.inject(SubPillarFormService);
    subPillarService = TestBed.inject(SubPillarService);
    extendedUserService = TestBed.inject(ExtendedUserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call ExtendedUser query and add missing value', () => {
      const subPillar: ISubPillar = { id: 13923 };
      const owner: IExtendedUser = { id: 26328 };
      subPillar.owner = owner;

      const extendedUserCollection: IExtendedUser[] = [{ id: 26328 }];
      jest.spyOn(extendedUserService, 'query').mockReturnValue(of(new HttpResponse({ body: extendedUserCollection })));
      const additionalExtendedUsers = [owner];
      const expectedCollection: IExtendedUser[] = [...additionalExtendedUsers, ...extendedUserCollection];
      jest.spyOn(extendedUserService, 'addExtendedUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ subPillar });
      comp.ngOnInit();

      expect(extendedUserService.query).toHaveBeenCalled();
      expect(extendedUserService.addExtendedUserToCollectionIfMissing).toHaveBeenCalledWith(
        extendedUserCollection,
        ...additionalExtendedUsers.map(expect.objectContaining),
      );
      expect(comp.extendedUsersSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const subPillar: ISubPillar = { id: 13923 };
      const owner: IExtendedUser = { id: 26328 };
      subPillar.owner = owner;

      activatedRoute.data = of({ subPillar });
      comp.ngOnInit();

      expect(comp.extendedUsersSharedCollection).toContainEqual(owner);
      expect(comp.subPillar).toEqual(subPillar);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubPillar>>();
      const subPillar = { id: 23772 };
      jest.spyOn(subPillarFormService, 'getSubPillar').mockReturnValue(subPillar);
      jest.spyOn(subPillarService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subPillar });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subPillar }));
      saveSubject.complete();

      // THEN
      expect(subPillarFormService.getSubPillar).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(subPillarService.update).toHaveBeenCalledWith(expect.objectContaining(subPillar));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubPillar>>();
      const subPillar = { id: 23772 };
      jest.spyOn(subPillarFormService, 'getSubPillar').mockReturnValue({ id: null });
      jest.spyOn(subPillarService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subPillar: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subPillar }));
      saveSubject.complete();

      // THEN
      expect(subPillarFormService.getSubPillar).toHaveBeenCalled();
      expect(subPillarService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubPillar>>();
      const subPillar = { id: 23772 };
      jest.spyOn(subPillarService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subPillar });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(subPillarService.update).toHaveBeenCalled();
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
