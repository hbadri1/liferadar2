import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { SubLifePillarService } from '../service/sub-life-pillar.service';
import { ISubLifePillar } from '../sub-life-pillar.model';
import { SubLifePillarFormService } from './sub-life-pillar-form.service';

import { SubLifePillarUpdateComponent } from './sub-life-pillar-update.component';

describe('SubLifePillar Management Update Component', () => {
  let comp: SubLifePillarUpdateComponent;
  let fixture: ComponentFixture<SubLifePillarUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let subLifePillarFormService: SubLifePillarFormService;
  let subLifePillarService: SubLifePillarService;
  let extendedUserService: ExtendedUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubLifePillarUpdateComponent],
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
      .overrideTemplate(SubLifePillarUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SubLifePillarUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    subLifePillarFormService = TestBed.inject(SubLifePillarFormService);
    subLifePillarService = TestBed.inject(SubLifePillarService);
    extendedUserService = TestBed.inject(ExtendedUserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call ExtendedUser query and add missing value', () => {
      const subLifePillar: ISubLifePillar = { id: 13923 };
      const owner: IExtendedUser = { id: 26328 };
      subLifePillar.owner = owner;

      const extendedUserCollection: IExtendedUser[] = [{ id: 26328 }];
      jest.spyOn(extendedUserService, 'query').mockReturnValue(of(new HttpResponse({ body: extendedUserCollection })));
      const additionalExtendedUsers = [owner];
      const expectedCollection: IExtendedUser[] = [...additionalExtendedUsers, ...extendedUserCollection];
      jest.spyOn(extendedUserService, 'addExtendedUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ subLifePillar });
      comp.ngOnInit();

      expect(extendedUserService.query).toHaveBeenCalled();
      expect(extendedUserService.addExtendedUserToCollectionIfMissing).toHaveBeenCalledWith(
        extendedUserCollection,
        ...additionalExtendedUsers.map(expect.objectContaining),
      );
      expect(comp.extendedUsersSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const subLifePillar: ISubLifePillar = { id: 13923 };
      const owner: IExtendedUser = { id: 26328 };
      subLifePillar.owner = owner;

      activatedRoute.data = of({ subLifePillar });
      comp.ngOnInit();

      expect(comp.extendedUsersSharedCollection).toContainEqual(owner);
      expect(comp.subLifePillar).toEqual(subLifePillar);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubLifePillar>>();
      const subLifePillar = { id: 23772 };
      jest.spyOn(subLifePillarFormService, 'getSubLifePillar').mockReturnValue(subLifePillar);
      jest.spyOn(subLifePillarService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subLifePillar });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subLifePillar }));
      saveSubject.complete();

      // THEN
      expect(subLifePillarFormService.getSubLifePillar).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(subLifePillarService.update).toHaveBeenCalledWith(expect.objectContaining(subLifePillar));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubLifePillar>>();
      const subLifePillar = { id: 23772 };
      jest.spyOn(subLifePillarFormService, 'getSubLifePillar').mockReturnValue({ id: null });
      jest.spyOn(subLifePillarService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subLifePillar: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subLifePillar }));
      saveSubject.complete();

      // THEN
      expect(subLifePillarFormService.getSubLifePillar).toHaveBeenCalled();
      expect(subLifePillarService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubLifePillar>>();
      const subLifePillar = { id: 23772 };
      jest.spyOn(subLifePillarService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subLifePillar });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(subLifePillarService.update).toHaveBeenCalled();
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
