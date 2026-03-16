import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { SubPillarItemService } from '../service/sub-pillar-item.service';
import { ISubPillarItem } from '../sub-pillar-item.model';
import { SubPillarItemFormService } from './sub-pillar-item-form.service';

import { SubPillarItemUpdateComponent } from './sub-pillar-item-update.component';

describe('SubPillarItem Management Update Component', () => {
  let comp: SubPillarItemUpdateComponent;
  let fixture: ComponentFixture<SubPillarItemUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let subPillarItemFormService: SubPillarItemFormService;
  let subPillarItemService: SubPillarItemService;
  let extendedUserService: ExtendedUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubPillarItemUpdateComponent],
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
      .overrideTemplate(SubPillarItemUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SubPillarItemUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    subPillarItemFormService = TestBed.inject(SubPillarItemFormService);
    subPillarItemService = TestBed.inject(SubPillarItemService);
    extendedUserService = TestBed.inject(ExtendedUserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call ExtendedUser query and add missing value', () => {
      const subPillarItem: ISubPillarItem = { id: 25568 };
      const owner: IExtendedUser = { id: 26328 };
      subPillarItem.owner = owner;

      const extendedUserCollection: IExtendedUser[] = [{ id: 26328 }];
      jest.spyOn(extendedUserService, 'query').mockReturnValue(of(new HttpResponse({ body: extendedUserCollection })));
      const additionalExtendedUsers = [owner];
      const expectedCollection: IExtendedUser[] = [...additionalExtendedUsers, ...extendedUserCollection];
      jest.spyOn(extendedUserService, 'addExtendedUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ subPillarItem });
      comp.ngOnInit();

      expect(extendedUserService.query).toHaveBeenCalled();
      expect(extendedUserService.addExtendedUserToCollectionIfMissing).toHaveBeenCalledWith(
        extendedUserCollection,
        ...additionalExtendedUsers.map(expect.objectContaining),
      );
      expect(comp.extendedUsersSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const subPillarItem: ISubPillarItem = { id: 25568 };
      const owner: IExtendedUser = { id: 26328 };
      subPillarItem.owner = owner;

      activatedRoute.data = of({ subPillarItem });
      comp.ngOnInit();

      expect(comp.extendedUsersSharedCollection).toContainEqual(owner);
      expect(comp.subPillarItem).toEqual(subPillarItem);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubPillarItem>>();
      const subPillarItem = { id: 7992 };
      jest.spyOn(subPillarItemFormService, 'getSubPillarItem').mockReturnValue(subPillarItem);
      jest.spyOn(subPillarItemService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subPillarItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subPillarItem }));
      saveSubject.complete();

      // THEN
      expect(subPillarItemFormService.getSubPillarItem).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(subPillarItemService.update).toHaveBeenCalledWith(expect.objectContaining(subPillarItem));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubPillarItem>>();
      const subPillarItem = { id: 7992 };
      jest.spyOn(subPillarItemFormService, 'getSubPillarItem').mockReturnValue({ id: null });
      jest.spyOn(subPillarItemService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subPillarItem: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subPillarItem }));
      saveSubject.complete();

      // THEN
      expect(subPillarItemFormService.getSubPillarItem).toHaveBeenCalled();
      expect(subPillarItemService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubPillarItem>>();
      const subPillarItem = { id: 7992 };
      jest.spyOn(subPillarItemService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subPillarItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(subPillarItemService.update).toHaveBeenCalled();
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
