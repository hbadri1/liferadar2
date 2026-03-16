import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { ISubPillarItem } from 'app/entities/sub-pillar-item/sub-pillar-item.model';
import { SubPillarItemService } from 'app/entities/sub-pillar-item/service/sub-pillar-item.service';
import { ILifeEvaluation } from '../life-evaluation.model';
import { LifeEvaluationService } from '../service/life-evaluation.service';
import { LifeEvaluationFormService } from './life-evaluation-form.service';

import { LifeEvaluationUpdateComponent } from './life-evaluation-update.component';

describe('LifeEvaluation Management Update Component', () => {
  let comp: LifeEvaluationUpdateComponent;
  let fixture: ComponentFixture<LifeEvaluationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let lifeEvaluationFormService: LifeEvaluationFormService;
  let lifeEvaluationService: LifeEvaluationService;
  let extendedUserService: ExtendedUserService;
  let subPillarItemService: SubPillarItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LifeEvaluationUpdateComponent],
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
      .overrideTemplate(LifeEvaluationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(LifeEvaluationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    lifeEvaluationFormService = TestBed.inject(LifeEvaluationFormService);
    lifeEvaluationService = TestBed.inject(LifeEvaluationService);
    extendedUserService = TestBed.inject(ExtendedUserService);
    subPillarItemService = TestBed.inject(SubPillarItemService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call ExtendedUser query and add missing value', () => {
      const lifeEvaluation: ILifeEvaluation = { id: 27366 };
      const owner: IExtendedUser = { id: 26328 };
      lifeEvaluation.owner = owner;

      const extendedUserCollection: IExtendedUser[] = [{ id: 26328 }];
      jest.spyOn(extendedUserService, 'query').mockReturnValue(of(new HttpResponse({ body: extendedUserCollection })));
      const additionalExtendedUsers = [owner];
      const expectedCollection: IExtendedUser[] = [...additionalExtendedUsers, ...extendedUserCollection];
      jest.spyOn(extendedUserService, 'addExtendedUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ lifeEvaluation });
      comp.ngOnInit();

      expect(extendedUserService.query).toHaveBeenCalled();
      expect(extendedUserService.addExtendedUserToCollectionIfMissing).toHaveBeenCalledWith(
        extendedUserCollection,
        ...additionalExtendedUsers.map(expect.objectContaining),
      );
      expect(comp.extendedUsersSharedCollection).toEqual(expectedCollection);
    });

    it('should call SubPillarItem query and add missing value', () => {
      const lifeEvaluation: ILifeEvaluation = { id: 27366 };
      const subPillarItem: ISubPillarItem = { id: 7992 };
      lifeEvaluation.subPillarItem = subPillarItem;

      const subPillarItemCollection: ISubPillarItem[] = [{ id: 7992 }];
      jest.spyOn(subPillarItemService, 'query').mockReturnValue(of(new HttpResponse({ body: subPillarItemCollection })));
      const additionalSubPillarItems = [subPillarItem];
      const expectedCollection: ISubPillarItem[] = [...additionalSubPillarItems, ...subPillarItemCollection];
      jest.spyOn(subPillarItemService, 'addSubPillarItemToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ lifeEvaluation });
      comp.ngOnInit();

      expect(subPillarItemService.query).toHaveBeenCalled();
      expect(subPillarItemService.addSubPillarItemToCollectionIfMissing).toHaveBeenCalledWith(
        subPillarItemCollection,
        ...additionalSubPillarItems.map(expect.objectContaining),
      );
      expect(comp.subPillarItemsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const lifeEvaluation: ILifeEvaluation = { id: 27366 };
      const owner: IExtendedUser = { id: 26328 };
      lifeEvaluation.owner = owner;
      const subPillarItem: ISubPillarItem = { id: 7992 };
      lifeEvaluation.subPillarItem = subPillarItem;

      activatedRoute.data = of({ lifeEvaluation });
      comp.ngOnInit();

      expect(comp.extendedUsersSharedCollection).toContainEqual(owner);
      expect(comp.subPillarItemsSharedCollection).toContainEqual(subPillarItem);
      expect(comp.lifeEvaluation).toEqual(lifeEvaluation);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILifeEvaluation>>();
      const lifeEvaluation = { id: 11329 };
      jest.spyOn(lifeEvaluationFormService, 'getLifeEvaluation').mockReturnValue(lifeEvaluation);
      jest.spyOn(lifeEvaluationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ lifeEvaluation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: lifeEvaluation }));
      saveSubject.complete();

      // THEN
      expect(lifeEvaluationFormService.getLifeEvaluation).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(lifeEvaluationService.update).toHaveBeenCalledWith(expect.objectContaining(lifeEvaluation));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILifeEvaluation>>();
      const lifeEvaluation = { id: 11329 };
      jest.spyOn(lifeEvaluationFormService, 'getLifeEvaluation').mockReturnValue({ id: null });
      jest.spyOn(lifeEvaluationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ lifeEvaluation: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: lifeEvaluation }));
      saveSubject.complete();

      // THEN
      expect(lifeEvaluationFormService.getLifeEvaluation).toHaveBeenCalled();
      expect(lifeEvaluationService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILifeEvaluation>>();
      const lifeEvaluation = { id: 11329 };
      jest.spyOn(lifeEvaluationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ lifeEvaluation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(lifeEvaluationService.update).toHaveBeenCalled();
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

    describe('compareSubPillarItem', () => {
      it('should forward to subPillarItemService', () => {
        const entity = { id: 7992 };
        const entity2 = { id: 25568 };
        jest.spyOn(subPillarItemService, 'compareSubPillarItem');
        comp.compareSubPillarItem(entity, entity2);
        expect(subPillarItemService.compareSubPillarItem).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
