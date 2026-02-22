import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { ISubLifePillar } from 'app/entities/sub-life-pillar/sub-life-pillar.model';
import { SubLifePillarService } from 'app/entities/sub-life-pillar/service/sub-life-pillar.service';
import { SubLifePillarTranslationService } from '../service/sub-life-pillar-translation.service';
import { ISubLifePillarTranslation } from '../sub-life-pillar-translation.model';
import { SubLifePillarTranslationFormService } from './sub-life-pillar-translation-form.service';

import { SubLifePillarTranslationUpdateComponent } from './sub-life-pillar-translation-update.component';

describe('SubLifePillarTranslation Management Update Component', () => {
  let comp: SubLifePillarTranslationUpdateComponent;
  let fixture: ComponentFixture<SubLifePillarTranslationUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let subLifePillarTranslationFormService: SubLifePillarTranslationFormService;
  let subLifePillarTranslationService: SubLifePillarTranslationService;
  let subLifePillarService: SubLifePillarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubLifePillarTranslationUpdateComponent],
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
      .overrideTemplate(SubLifePillarTranslationUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(SubLifePillarTranslationUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    subLifePillarTranslationFormService = TestBed.inject(SubLifePillarTranslationFormService);
    subLifePillarTranslationService = TestBed.inject(SubLifePillarTranslationService);
    subLifePillarService = TestBed.inject(SubLifePillarService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call SubLifePillar query and add missing value', () => {
      const subLifePillarTranslation: ISubLifePillarTranslation = { id: 19960 };
      const subLifePillar: ISubLifePillar = { id: 23772 };
      subLifePillarTranslation.subLifePillar = subLifePillar;

      const subLifePillarCollection: ISubLifePillar[] = [{ id: 23772 }];
      jest.spyOn(subLifePillarService, 'query').mockReturnValue(of(new HttpResponse({ body: subLifePillarCollection })));
      const additionalSubLifePillars = [subLifePillar];
      const expectedCollection: ISubLifePillar[] = [...additionalSubLifePillars, ...subLifePillarCollection];
      jest.spyOn(subLifePillarService, 'addSubLifePillarToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ subLifePillarTranslation });
      comp.ngOnInit();

      expect(subLifePillarService.query).toHaveBeenCalled();
      expect(subLifePillarService.addSubLifePillarToCollectionIfMissing).toHaveBeenCalledWith(
        subLifePillarCollection,
        ...additionalSubLifePillars.map(expect.objectContaining),
      );
      expect(comp.subLifePillarsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const subLifePillarTranslation: ISubLifePillarTranslation = { id: 19960 };
      const subLifePillar: ISubLifePillar = { id: 23772 };
      subLifePillarTranslation.subLifePillar = subLifePillar;

      activatedRoute.data = of({ subLifePillarTranslation });
      comp.ngOnInit();

      expect(comp.subLifePillarsSharedCollection).toContainEqual(subLifePillar);
      expect(comp.subLifePillarTranslation).toEqual(subLifePillarTranslation);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubLifePillarTranslation>>();
      const subLifePillarTranslation = { id: 7484 };
      jest.spyOn(subLifePillarTranslationFormService, 'getSubLifePillarTranslation').mockReturnValue(subLifePillarTranslation);
      jest.spyOn(subLifePillarTranslationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subLifePillarTranslation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subLifePillarTranslation }));
      saveSubject.complete();

      // THEN
      expect(subLifePillarTranslationFormService.getSubLifePillarTranslation).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(subLifePillarTranslationService.update).toHaveBeenCalledWith(expect.objectContaining(subLifePillarTranslation));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubLifePillarTranslation>>();
      const subLifePillarTranslation = { id: 7484 };
      jest.spyOn(subLifePillarTranslationFormService, 'getSubLifePillarTranslation').mockReturnValue({ id: null });
      jest.spyOn(subLifePillarTranslationService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subLifePillarTranslation: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: subLifePillarTranslation }));
      saveSubject.complete();

      // THEN
      expect(subLifePillarTranslationFormService.getSubLifePillarTranslation).toHaveBeenCalled();
      expect(subLifePillarTranslationService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ISubLifePillarTranslation>>();
      const subLifePillarTranslation = { id: 7484 };
      jest.spyOn(subLifePillarTranslationService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ subLifePillarTranslation });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(subLifePillarTranslationService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareSubLifePillar', () => {
      it('should forward to subLifePillarService', () => {
        const entity = { id: 23772 };
        const entity2 = { id: 13923 };
        jest.spyOn(subLifePillarService, 'compareSubLifePillar');
        comp.compareSubLifePillar(entity, entity2);
        expect(subLifePillarService.compareSubLifePillar).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
