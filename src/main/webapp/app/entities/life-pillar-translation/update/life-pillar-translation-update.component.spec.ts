import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ILifePillar } from 'app/entities/life-pillar/life-pillar.model';
import { LifePillarService } from 'app/entities/life-pillar/service/life-pillar.service';
import { LifePillarTranslationService } from '../service/life-pillar-translation.service';
import { ILifePillarTranslation } from '../life-pillar-translation.model';
import { LifePillarTranslationFormService } from './life-pillar-translation-form.service';

import { LifePillarTranslationUpdateComponent } from './life-pillar-translation-update.component';

describe('LifePillarTranslation Management Update Component', () => {
  let comp: LifePillarTranslationUpdateComponent;
  let fixture: ComponentFixture<LifePillarTranslationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let lifePillarTranslationFormService: LifePillarTranslationFormService;
  let lifePillarTranslationService: LifePillarTranslationService;
  let lifePillarService: LifePillarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LifePillarTranslationUpdateComponent],
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
      .overrideTemplate(LifePillarTranslationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(LifePillarTranslationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    lifePillarTranslationFormService = TestBed.inject(LifePillarTranslationFormService);
    lifePillarTranslationService = TestBed.inject(LifePillarTranslationService);
    lifePillarService = TestBed.inject(LifePillarService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call LifePillar query and add missing value', () => {
      const lifePillarTranslation: ILifePillarTranslation = { id: 23537 };
      const lifePillar: ILifePillar = { id: 15771 };
      lifePillarTranslation.lifePillar = lifePillar;

      const lifePillarCollection: ILifePillar[] = [{ id: 15771 }];
      jest.spyOn(lifePillarService, 'query').mockReturnValue(of(new HttpResponse({ body: lifePillarCollection })));
      const additionalLifePillars = [lifePillar];
      const expectedCollection: ILifePillar[] = [...additionalLifePillars, ...lifePillarCollection];
      jest.spyOn(lifePillarService, 'addLifePillarToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ lifePillarTranslation });
      comp.ngOnInit();

      expect(lifePillarService.query).toHaveBeenCalled();
      expect(lifePillarService.addLifePillarToCollectionIfMissing).toHaveBeenCalledWith(
        lifePillarCollection,
        ...additionalLifePillars.map(expect.objectContaining),
      );
      expect(comp.lifePillarsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const lifePillarTranslation: ILifePillarTranslation = { id: 23537 };
      const lifePillar: ILifePillar = { id: 15771 };
      lifePillarTranslation.lifePillar = lifePillar;

      activatedRoute.data = of({ lifePillarTranslation });
      comp.ngOnInit();

      expect(comp.lifePillarsSharedCollection).toContainEqual(lifePillar);
      expect(comp.lifePillarTranslation).toEqual(lifePillarTranslation);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILifePillarTranslation>>();
      const lifePillarTranslation = { id: 22644 };
      jest.spyOn(lifePillarTranslationFormService, 'getLifePillarTranslation').mockReturnValue(lifePillarTranslation);
      jest.spyOn(lifePillarTranslationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ lifePillarTranslation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: lifePillarTranslation }));
      saveSubject.complete();

      // THEN
      expect(lifePillarTranslationFormService.getLifePillarTranslation).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(lifePillarTranslationService.update).toHaveBeenCalledWith(expect.objectContaining(lifePillarTranslation));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILifePillarTranslation>>();
      const lifePillarTranslation = { id: 22644 };
      jest.spyOn(lifePillarTranslationFormService, 'getLifePillarTranslation').mockReturnValue({ id: null });
      jest.spyOn(lifePillarTranslationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ lifePillarTranslation: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: lifePillarTranslation }));
      saveSubject.complete();

      // THEN
      expect(lifePillarTranslationFormService.getLifePillarTranslation).toHaveBeenCalled();
      expect(lifePillarTranslationService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ILifePillarTranslation>>();
      const lifePillarTranslation = { id: 22644 };
      jest.spyOn(lifePillarTranslationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ lifePillarTranslation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(lifePillarTranslationService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareLifePillar', () => {
      it('should forward to lifePillarService', () => {
        const entity = { id: 15771 };
        const entity2 = { id: 28451 };
        jest.spyOn(lifePillarService, 'compareLifePillar');
        comp.compareLifePillar(entity, entity2);
        expect(lifePillarService.compareLifePillar).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
