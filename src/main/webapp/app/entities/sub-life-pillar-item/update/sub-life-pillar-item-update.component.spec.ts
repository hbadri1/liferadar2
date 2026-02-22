import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { SubLifePillarItemService } from '../service/sub-life-pillar-item.service';
import { ISubLifePillarItem } from '../sub-life-pillar-item.model';
import { SubLifePillarItemFormService } from './sub-life-pillar-item-form.service';

import { SubLifePillarItemUpdateComponent } from './sub-life-pillar-item-update.component';

describe('SubLifePillarItem Management Update Component', () => {
  let comp: SubLifePillarItemUpdateComponent;
  let fixture: ComponentFixture<SubLifePillarItemUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let subLifePillarItemFormService: SubLifePillarItemFormService;
  let subLifePillarItemService: SubLifePillarItemService;
  let extendedUserService: ExtendedUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubLifePillarItemUpdateComponent],
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
      .overrideTemplate(SubLifePillarItemUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SubLifePillarItemUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    subLifePillarItemFormService = TestBed.inject(SubLifePillarItemFormService);
    subLifePillarItemService = TestBed.inject(SubLifePillarItemService);
    extendedUserService = TestBed.inject(ExtendedUserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call ExtendedUser query and add missing value', () => {
      const subLifePillarItem: ISubLifePillarItem = { id: 25568 };
      const owner: IExtendedUser = { id: 26328 };
      subLifePillarItem.owner = owner;

      const extendedUserCollection: IExtendedUser[] = [{ id: 26328 }];
      jest.spyOn(extendedUserService, 'query').mockReturnValue(of(new HttpResponse({ body: extendedUserCollection })));
      const additionalExtendedUsers = [owner];
      const expectedCollection: IExtendedUser[] = [...additionalExtendedUsers, ...extendedUserCollection];
      jest.spyOn(extendedUserService, 'addExtendedUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ subLifePillarItem });
      comp.ngOnInit();

      expect(extendedUserService.query).toHaveBeenCalled();
      expect(extendedUserService.addExtendedUserToCollectionIfMissing).toHaveBeenCalledWith(
        extendedUserCollection,
        ...additionalExtendedUsers.map(expect.objectContaining),
      );
      expect(comp.extendedUsersSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const subLifePillarItem: ISubLifePillarItem = { id: 25568 };
      const owner: IExtendedUser = { id: 26328 };
      subLifePillarItem.owner = owner;

      activatedRoute.data = of({ subLifePillarItem });
      comp.ngOnInit();

      expect(comp.extendedUsersSharedCollection).toContainEqual(owner);
      expect(comp.subLifePillarItem).toEqual(subLifePillarItem);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubLifePillarItem>>();
      const subLifePillarItem = { id: 7992 };
      jest.spyOn(subLifePillarItemFormService, 'getSubLifePillarItem').mockReturnValue(subLifePillarItem);
      jest.spyOn(subLifePillarItemService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subLifePillarItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subLifePillarItem }));
      saveSubject.complete();

      // THEN
      expect(subLifePillarItemFormService.getSubLifePillarItem).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(subLifePillarItemService.update).toHaveBeenCalledWith(expect.objectContaining(subLifePillarItem));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubLifePillarItem>>();
      const subLifePillarItem = { id: 7992 };
      jest.spyOn(subLifePillarItemFormService, 'getSubLifePillarItem').mockReturnValue({ id: null });
      jest.spyOn(subLifePillarItemService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subLifePillarItem: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subLifePillarItem }));
      saveSubject.complete();

      // THEN
      expect(subLifePillarItemFormService.getSubLifePillarItem).toHaveBeenCalled();
      expect(subLifePillarItemService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubLifePillarItem>>();
      const subLifePillarItem = { id: 7992 };
      jest.spyOn(subLifePillarItemService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subLifePillarItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(subLifePillarItemService.update).toHaveBeenCalled();
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
