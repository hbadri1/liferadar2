import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IPillar } from 'app/entities/pillar/pillar.model';
import { PillarService } from 'app/entities/pillar/service/pillar.service';
import { PillarTranslationService } from '../service/pillar-translation.service';
import { IPillarTranslation } from '../pillar-translation.model';
import { PillarTranslationFormService } from './pillar-translation-form.service';

import { PillarTranslationUpdateComponent } from './pillar-translation-update.component';

describe('PillarTranslation Management Update Component', () => {
  let comp: PillarTranslationUpdateComponent;
  let fixture: ComponentFixture<PillarTranslationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let pillarTranslationFormService: PillarTranslationFormService;
  let pillarTranslationService: PillarTranslationService;
  let pillarService: PillarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PillarTranslationUpdateComponent],
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
      .overrideTemplate(PillarTranslationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(PillarTranslationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    pillarTranslationFormService = TestBed.inject(PillarTranslationFormService);
    pillarTranslationService = TestBed.inject(PillarTranslationService);
    pillarService = TestBed.inject(PillarService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Pillar query and add missing value', () => {
      const pillarTranslation: IPillarTranslation = { id: 23537 };
      const pillar: IPillar = { id: 15771 };
      pillarTranslation.pillar = pillar;

      const pillarCollection: IPillar[] = [{ id: 15771 }];
      jest.spyOn(pillarService, 'query').mockReturnValue(of(new HttpResponse({ body: pillarCollection })));
      const additionalPillars = [pillar];
      const expectedCollection: IPillar[] = [...additionalPillars, ...pillarCollection];
      jest.spyOn(pillarService, 'addPillarToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ pillarTranslation });
      comp.ngOnInit();

      expect(pillarService.query).toHaveBeenCalled();
      expect(pillarService.addPillarToCollectionIfMissing).toHaveBeenCalledWith(
        pillarCollection,
        ...additionalPillars.map(expect.objectContaining),
      );
      expect(comp.pillarsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const pillarTranslation: IPillarTranslation = { id: 23537 };
      const pillar: IPillar = { id: 15771 };
      pillarTranslation.pillar = pillar;

      activatedRoute.data = of({ pillarTranslation });
      comp.ngOnInit();

      expect(comp.pillarsSharedCollection).toContainEqual(pillar);
      expect(comp.pillarTranslation).toEqual(pillarTranslation);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPillarTranslation>>();
      const pillarTranslation = { id: 22644 };
      jest.spyOn(pillarTranslationFormService, 'getPillarTranslation').mockReturnValue(pillarTranslation);
      jest.spyOn(pillarTranslationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pillarTranslation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: pillarTranslation }));
      saveSubject.complete();

      // THEN
      expect(pillarTranslationFormService.getPillarTranslation).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(pillarTranslationService.update).toHaveBeenCalledWith(expect.objectContaining(pillarTranslation));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPillarTranslation>>();
      const pillarTranslation = { id: 22644 };
      jest.spyOn(pillarTranslationFormService, 'getPillarTranslation').mockReturnValue({ id: null });
      jest.spyOn(pillarTranslationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pillarTranslation: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: pillarTranslation }));
      saveSubject.complete();

      // THEN
      expect(pillarTranslationFormService.getPillarTranslation).toHaveBeenCalled();
      expect(pillarTranslationService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPillarTranslation>>();
      const pillarTranslation = { id: 22644 };
      jest.spyOn(pillarTranslationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ pillarTranslation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(pillarTranslationService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('comparePillar', () => {
      it('should forward to pillarService', () => {
        const entity = { id: 15771 };
        const entity2 = { id: 28451 };
        jest.spyOn(pillarService, 'comparePillar');
        comp.comparePillar(entity, entity2);
        expect(pillarService.comparePillar).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
