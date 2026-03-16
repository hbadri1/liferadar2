import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ISubPillarItem } from 'app/entities/sub-pillar-item/sub-pillar-item.model';
import { SubPillarItemService } from 'app/entities/sub-pillar-item/service/sub-pillar-item.service';
import { SubPillarItemTranslationService } from '../service/sub-pillar-item-translation.service';
import { ISubPillarItemTranslation } from '../sub-pillar-item-translation.model';
import { SubPillarItemTranslationFormService } from './sub-pillar-item-translation-form.service';

import { SubPillarItemTranslationUpdateComponent } from './sub-pillar-item-translation-update.component';

describe('SubPillarItemTranslation Management Update Component', () => {
  let comp: SubPillarItemTranslationUpdateComponent;
  let fixture: ComponentFixture<SubPillarItemTranslationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let subPillarItemTranslationFormService: SubPillarItemTranslationFormService;
  let subPillarItemTranslationService: SubPillarItemTranslationService;
  let subPillarItemService: SubPillarItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubPillarItemTranslationUpdateComponent],
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
      .overrideTemplate(SubPillarItemTranslationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SubPillarItemTranslationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    subPillarItemTranslationFormService = TestBed.inject(SubPillarItemTranslationFormService);
    subPillarItemTranslationService = TestBed.inject(SubPillarItemTranslationService);
    subPillarItemService = TestBed.inject(SubPillarItemService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call SubPillarItem query and add missing value', () => {
      const subPillarItemTranslation: ISubPillarItemTranslation = { id: 15570 };
      const subPillarItem: ISubPillarItem = { id: 7992 };
      subPillarItemTranslation.subPillarItem = subPillarItem;

      const subPillarItemCollection: ISubPillarItem[] = [{ id: 7992 }];
      jest.spyOn(subPillarItemService, 'query').mockReturnValue(of(new HttpResponse({ body: subPillarItemCollection })));
      const additionalSubPillarItems = [subPillarItem];
      const expectedCollection: ISubPillarItem[] = [...additionalSubPillarItems, ...subPillarItemCollection];
      jest.spyOn(subPillarItemService, 'addSubPillarItemToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ subPillarItemTranslation });
      comp.ngOnInit();

      expect(subPillarItemService.query).toHaveBeenCalled();
      expect(subPillarItemService.addSubPillarItemToCollectionIfMissing).toHaveBeenCalledWith(
        subPillarItemCollection,
        ...additionalSubPillarItems.map(expect.objectContaining),
      );
      expect(comp.subPillarItemsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const subPillarItemTranslation: ISubPillarItemTranslation = { id: 15570 };
      const subPillarItem: ISubPillarItem = { id: 7992 };
      subPillarItemTranslation.subPillarItem = subPillarItem;

      activatedRoute.data = of({ subPillarItemTranslation });
      comp.ngOnInit();

      expect(comp.subPillarItemsSharedCollection).toContainEqual(subPillarItem);
      expect(comp.subPillarItemTranslation).toEqual(subPillarItemTranslation);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubPillarItemTranslation>>();
      const subPillarItemTranslation = { id: 28830 };
      jest.spyOn(subPillarItemTranslationFormService, 'getSubPillarItemTranslation').mockReturnValue(subPillarItemTranslation);
      jest.spyOn(subPillarItemTranslationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subPillarItemTranslation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subPillarItemTranslation }));
      saveSubject.complete();

      // THEN
      expect(subPillarItemTranslationFormService.getSubPillarItemTranslation).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(subPillarItemTranslationService.update).toHaveBeenCalledWith(expect.objectContaining(subPillarItemTranslation));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubPillarItemTranslation>>();
      const subPillarItemTranslation = { id: 28830 };
      jest.spyOn(subPillarItemTranslationFormService, 'getSubPillarItemTranslation').mockReturnValue({ id: null });
      jest.spyOn(subPillarItemTranslationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subPillarItemTranslation: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subPillarItemTranslation }));
      saveSubject.complete();

      // THEN
      expect(subPillarItemTranslationFormService.getSubPillarItemTranslation).toHaveBeenCalled();
      expect(subPillarItemTranslationService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubPillarItemTranslation>>();
      const subPillarItemTranslation = { id: 28830 };
      jest.spyOn(subPillarItemTranslationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subPillarItemTranslation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(subPillarItemTranslationService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
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
