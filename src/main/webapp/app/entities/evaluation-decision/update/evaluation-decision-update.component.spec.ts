import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, from, of } from 'rxjs';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { ILifeEvaluation } from 'app/entities/life-evaluation/life-evaluation.model';
import { LifeEvaluationService } from 'app/entities/life-evaluation/service/life-evaluation.service';
import { IEvaluationDecision } from '../evaluation-decision.model';
import { EvaluationDecisionService } from '../service/evaluation-decision.service';
import { EvaluationDecisionFormService } from './evaluation-decision-form.service';

import { EvaluationDecisionUpdateComponent } from './evaluation-decision-update.component';

describe('EvaluationDecision Management Update Component', () => {
  let comp: EvaluationDecisionUpdateComponent;
  let fixture: ComponentFixture<EvaluationDecisionUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let evaluationDecisionFormService: EvaluationDecisionFormService;
  let evaluationDecisionService: EvaluationDecisionService;
  let extendedUserService: ExtendedUserService;
  let lifeEvaluationService: LifeEvaluationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EvaluationDecisionUpdateComponent],
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
      .overrideTemplate(EvaluationDecisionUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(EvaluationDecisionUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    evaluationDecisionFormService = TestBed.inject(EvaluationDecisionFormService);
    evaluationDecisionService = TestBed.inject(EvaluationDecisionService);
    extendedUserService = TestBed.inject(ExtendedUserService);
    lifeEvaluationService = TestBed.inject(LifeEvaluationService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call ExtendedUser query and add missing value', () => {
      const evaluationDecision: IEvaluationDecision = { id: 11812 };
      const owner: IExtendedUser = { id: 26328 };
      evaluationDecision.owner = owner;

      const extendedUserCollection: IExtendedUser[] = [{ id: 26328 }];
      jest.spyOn(extendedUserService, 'query').mockReturnValue(of(new HttpResponse({ body: extendedUserCollection })));
      const additionalExtendedUsers = [owner];
      const expectedCollection: IExtendedUser[] = [...additionalExtendedUsers, ...extendedUserCollection];
      jest.spyOn(extendedUserService, 'addExtendedUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ evaluationDecision });
      comp.ngOnInit();

      expect(extendedUserService.query).toHaveBeenCalled();
      expect(extendedUserService.addExtendedUserToCollectionIfMissing).toHaveBeenCalledWith(
        extendedUserCollection,
        ...additionalExtendedUsers.map(expect.objectContaining),
      );
      expect(comp.extendedUsersSharedCollection).toEqual(expectedCollection);
    });

    it('should call LifeEvaluation query and add missing value', () => {
      const evaluationDecision: IEvaluationDecision = { id: 11812 };
      const lifeEvaluation: ILifeEvaluation = { id: 11329 };
      evaluationDecision.lifeEvaluation = lifeEvaluation;

      const lifeEvaluationCollection: ILifeEvaluation[] = [{ id: 11329 }];
      jest.spyOn(lifeEvaluationService, 'query').mockReturnValue(of(new HttpResponse({ body: lifeEvaluationCollection })));
      const additionalLifeEvaluations = [lifeEvaluation];
      const expectedCollection: ILifeEvaluation[] = [...additionalLifeEvaluations, ...lifeEvaluationCollection];
      jest.spyOn(lifeEvaluationService, 'addLifeEvaluationToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ evaluationDecision });
      comp.ngOnInit();

      expect(lifeEvaluationService.query).toHaveBeenCalled();
      expect(lifeEvaluationService.addLifeEvaluationToCollectionIfMissing).toHaveBeenCalledWith(
        lifeEvaluationCollection,
        ...additionalLifeEvaluations.map(expect.objectContaining),
      );
      expect(comp.lifeEvaluationsSharedCollection).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const evaluationDecision: IEvaluationDecision = { id: 11812 };
      const owner: IExtendedUser = { id: 26328 };
      evaluationDecision.owner = owner;
      const lifeEvaluation: ILifeEvaluation = { id: 11329 };
      evaluationDecision.lifeEvaluation = lifeEvaluation;

      activatedRoute.data = of({ evaluationDecision });
      comp.ngOnInit();

      expect(comp.extendedUsersSharedCollection).toContainEqual(owner);
      expect(comp.lifeEvaluationsSharedCollection).toContainEqual(lifeEvaluation);
      expect(comp.evaluationDecision).toEqual(evaluationDecision);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEvaluationDecision>>();
      const evaluationDecision = { id: 25936 };
      jest.spyOn(evaluationDecisionFormService, 'getEvaluationDecision').mockReturnValue(evaluationDecision);
      jest.spyOn(evaluationDecisionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ evaluationDecision });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: evaluationDecision }));
      saveSubject.complete();

      // THEN
      expect(evaluationDecisionFormService.getEvaluationDecision).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(evaluationDecisionService.update).toHaveBeenCalledWith(expect.objectContaining(evaluationDecision));
      expect(comp.isSaving).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEvaluationDecision>>();
      const evaluationDecision = { id: 25936 };
      jest.spyOn(evaluationDecisionFormService, 'getEvaluationDecision').mockReturnValue({ id: null });
      jest.spyOn(evaluationDecisionService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ evaluationDecision: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: evaluationDecision }));
      saveSubject.complete();

      // THEN
      expect(evaluationDecisionFormService.getEvaluationDecision).toHaveBeenCalled();
      expect(evaluationDecisionService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IEvaluationDecision>>();
      const evaluationDecision = { id: 25936 };
      jest.spyOn(evaluationDecisionService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ evaluationDecision });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(evaluationDecisionService.update).toHaveBeenCalled();
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

    describe('compareLifeEvaluation', () => {
      it('should forward to lifeEvaluationService', () => {
        const entity = { id: 11329 };
        const entity2 = { id: 27366 };
        jest.spyOn(lifeEvaluationService, 'compareLifeEvaluation');
        comp.compareLifeEvaluation(entity, entity2);
        expect(lifeEvaluationService.compareLifeEvaluation).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
