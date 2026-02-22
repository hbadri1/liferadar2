import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ISubLifePillarItem } from 'app/entities/sub-life-pillar-item/sub-life-pillar-item.model';
import { SubLifePillarItemService } from 'app/entities/sub-life-pillar-item/service/sub-life-pillar-item.service';
import { SubLifePillarItemTranslationService } from '../service/sub-life-pillar-item-translation.service';
import { ISubLifePillarItemTranslation } from '../sub-life-pillar-item-translation.model';
import { SubLifePillarItemTranslationFormService } from './sub-life-pillar-item-translation-form.service';

import { SubLifePillarItemTranslationUpdateComponent } from './sub-life-pillar-item-translation-update.component';

describe('SubLifePillarItemTranslation Management Update Component', () => {
  let comp: SubLifePillarItemTranslationUpdateComponent;
  let fixture: ComponentFixture<SubLifePillarItemTranslationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let subLifePillarItemTranslationFormService: SubLifePillarItemTranslationFormService;
  let subLifePillarItemTranslationService: SubLifePillarItemTranslationService;
  let subLifePillarItemService: SubLifePillarItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubLifePillarItemTranslationUpdateComponent],
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
      .overrideTemplate(SubLifePillarItemTranslationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SubLifePillarItemTranslationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    subLifePillarItemTranslationFormService = TestBed.inject(SubLifePillarItemTranslationFormService);
    subLifePillarItemTranslationService = TestBed.inject(SubLifePillarItemTranslationService);
    subLifePillarItemService = TestBed.inject(SubLifePillarItemService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call SubLifePillarItem query and add missing value', () => {
      const subLifePillarItemTranslation: ISubLifePillarItemTranslation = { id: 15570 };
      const subLifePillarItem: ISubLifePillarItem = { id: 7992 };
      subLifePillarItemTranslation.subLifePillarItem = subLifePillarItem;

      const subLifePillarItemCollection: ISubLifePillarItem[] = [{ id: 7992 }];
      jest.spyOn(subLifePillarItemService, 'query').mockReturnValue(of(new HttpResponse({ body: subLifePillarItemCollection })));
      const additionalSubLifePillarItems = [subLifePillarItem];
      const expectedCollection: ISubLifePillarItem[] = [...additionalSubLifePillarItems, ...subLifePillarItemCollection];
      jest.spyOn(subLifePillarItemService, 'addSubLifePillarItemToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ subLifePillarItemTranslation });
      comp.ngOnInit();

      expect(subLifePillarItemService.query).toHaveBeenCalled();
      expect(subLifePillarItemService.addSubLifePillarItemToCollectionIfMissing).toHaveBeenCalledWith(
        subLifePillarItemCollection,
        ...additionalSubLifePillarItems.map(expect.objectContaining),
      );
      expect(comp.subLifePillarItemsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const subLifePillarItemTranslation: ISubLifePillarItemTranslation = { id: 15570 };
      const subLifePillarItem: ISubLifePillarItem = { id: 7992 };
      subLifePillarItemTranslation.subLifePillarItem = subLifePillarItem;

      activatedRoute.data = of({ subLifePillarItemTranslation });
      comp.ngOnInit();

      expect(comp.subLifePillarItemsSharedCollection).toContainEqual(subLifePillarItem);
      expect(comp.subLifePillarItemTranslation).toEqual(subLifePillarItemTranslation);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubLifePillarItemTranslation>>();
      const subLifePillarItemTranslation = { id: 28830 };
      jest.spyOn(subLifePillarItemTranslationFormService, 'getSubLifePillarItemTranslation').mockReturnValue(subLifePillarItemTranslation);
      jest.spyOn(subLifePillarItemTranslationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subLifePillarItemTranslation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subLifePillarItemTranslation }));
      saveSubject.complete();

      // THEN
      expect(subLifePillarItemTranslationFormService.getSubLifePillarItemTranslation).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(subLifePillarItemTranslationService.update).toHaveBeenCalledWith(expect.objectContaining(subLifePillarItemTranslation));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubLifePillarItemTranslation>>();
      const subLifePillarItemTranslation = { id: 28830 };
      jest.spyOn(subLifePillarItemTranslationFormService, 'getSubLifePillarItemTranslation').mockReturnValue({ id: null });
      jest.spyOn(subLifePillarItemTranslationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subLifePillarItemTranslation: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subLifePillarItemTranslation }));
      saveSubject.complete();

      // THEN
      expect(subLifePillarItemTranslationFormService.getSubLifePillarItemTranslation).toHaveBeenCalled();
      expect(subLifePillarItemTranslationService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubLifePillarItemTranslation>>();
      const subLifePillarItemTranslation = { id: 28830 };
      jest.spyOn(subLifePillarItemTranslationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subLifePillarItemTranslation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(subLifePillarItemTranslationService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareSubLifePillarItem', () => {
      it('should forward to subLifePillarItemService', () => {
        const entity = { id: 7992 };
        const entity2 = { id: 25568 };
        jest.spyOn(subLifePillarItemService, 'compareSubLifePillarItem');
        comp.compareSubLifePillarItem(entity, entity2);
        expect(subLifePillarItemService.compareSubLifePillarItem).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
