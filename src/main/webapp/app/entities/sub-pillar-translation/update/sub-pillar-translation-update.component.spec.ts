import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ISubPillar } from 'app/entities/sub-pillar/sub-pillar.model';
import { SubPillarService } from 'app/entities/sub-pillar/service/sub-pillar.service';
import { SubPillarTranslationService } from '../service/sub-pillar-translation.service';
import { ISubPillarTranslation } from '../sub-pillar-translation.model';
import { SubPillarTranslationFormService } from './sub-pillar-translation-form.service';

import { SubPillarTranslationUpdateComponent } from './sub-pillar-translation-update.component';

describe('SubPillarTranslation Management Update Component', () => {
  let comp: SubPillarTranslationUpdateComponent;
  let fixture: ComponentFixture<SubPillarTranslationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let subPillarTranslationFormService: SubPillarTranslationFormService;
  let subPillarTranslationService: SubPillarTranslationService;
  let subPillarService: SubPillarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubPillarTranslationUpdateComponent],
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
      .overrideTemplate(SubPillarTranslationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SubPillarTranslationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    subPillarTranslationFormService = TestBed.inject(SubPillarTranslationFormService);
    subPillarTranslationService = TestBed.inject(SubPillarTranslationService);
    subPillarService = TestBed.inject(SubPillarService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call SubPillar query and add missing value', () => {
      const subPillarTranslation: ISubPillarTranslation = { id: 19960 };
      const subPillar: ISubPillar = { id: 23772 };
      subPillarTranslation.subPillar = subPillar;

      const subPillarCollection: ISubPillar[] = [{ id: 23772 }];
      jest.spyOn(subPillarService, 'query').mockReturnValue(of(new HttpResponse({ body: subPillarCollection })));
      const additionalSubPillars = [subPillar];
      const expectedCollection: ISubPillar[] = [...additionalSubPillars, ...subPillarCollection];
      jest.spyOn(subPillarService, 'addSubPillarToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ subPillarTranslation });
      comp.ngOnInit();

      expect(subPillarService.query).toHaveBeenCalled();
      expect(subPillarService.addSubPillarToCollectionIfMissing).toHaveBeenCalledWith(
        subPillarCollection,
        ...additionalSubPillars.map(expect.objectContaining),
      );
      expect(comp.subPillarsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const subPillarTranslation: ISubPillarTranslation = { id: 19960 };
      const subPillar: ISubPillar = { id: 23772 };
      subPillarTranslation.subPillar = subPillar;

      activatedRoute.data = of({ subPillarTranslation });
      comp.ngOnInit();

      expect(comp.subPillarsSharedCollection).toContainEqual(subPillar);
      expect(comp.subPillarTranslation).toEqual(subPillarTranslation);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubPillarTranslation>>();
      const subPillarTranslation = { id: 7484 };
      jest.spyOn(subPillarTranslationFormService, 'getSubPillarTranslation').mockReturnValue(subPillarTranslation);
      jest.spyOn(subPillarTranslationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subPillarTranslation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subPillarTranslation }));
      saveSubject.complete();

      // THEN
      expect(subPillarTranslationFormService.getSubPillarTranslation).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(subPillarTranslationService.update).toHaveBeenCalledWith(expect.objectContaining(subPillarTranslation));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubPillarTranslation>>();
      const subPillarTranslation = { id: 7484 };
      jest.spyOn(subPillarTranslationFormService, 'getSubPillarTranslation').mockReturnValue({ id: null });
      jest.spyOn(subPillarTranslationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subPillarTranslation: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subPillarTranslation }));
      saveSubject.complete();

      // THEN
      expect(subPillarTranslationFormService.getSubPillarTranslation).toHaveBeenCalled();
      expect(subPillarTranslationService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubPillarTranslation>>();
      const subPillarTranslation = { id: 7484 };
      jest.spyOn(subPillarTranslationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subPillarTranslation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(subPillarTranslationService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareSubPillar', () => {
      it('should forward to subPillarService', () => {
        const entity = { id: 23772 };
        const entity2 = { id: 13923 };
        jest.spyOn(subPillarService, 'compareSubPillar');
        comp.compareSubPillar(entity, entity2);
        expect(subPillarService.compareSubPillar).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
