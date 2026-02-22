import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { ILifeEvaluation } from 'app/entities/life-evaluation/life-evaluation.model';
import { LifeEvaluationService } from 'app/entities/life-evaluation/service/life-evaluation.service';
import { EvaluationDecisionService } from '../service/evaluation-decision.service';
import { IEvaluationDecision } from '../evaluation-decision.model';
import { EvaluationDecisionFormGroup, EvaluationDecisionFormService } from './evaluation-decision-form.service';

@Component({
  selector: 'jhi-evaluation-decision-update',
  templateUrl: './evaluation-decision-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class EvaluationDecisionUpdateComponent implements OnInit {
  isSaving = false;
  evaluationDecision: IEvaluationDecision | null = null;

  extendedUsersSharedCollection: IExtendedUser[] = [];
  lifeEvaluationsSharedCollection: ILifeEvaluation[] = [];

  protected evaluationDecisionService = inject(EvaluationDecisionService);
  protected evaluationDecisionFormService = inject(EvaluationDecisionFormService);
  protected extendedUserService = inject(ExtendedUserService);
  protected lifeEvaluationService = inject(LifeEvaluationService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: EvaluationDecisionFormGroup = this.evaluationDecisionFormService.createEvaluationDecisionFormGroup();

  compareExtendedUser = (o1: IExtendedUser | null, o2: IExtendedUser | null): boolean =>
    this.extendedUserService.compareExtendedUser(o1, o2);

  compareLifeEvaluation = (o1: ILifeEvaluation | null, o2: ILifeEvaluation | null): boolean =>
    this.lifeEvaluationService.compareLifeEvaluation(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ evaluationDecision }) => {
      this.evaluationDecision = evaluationDecision;
      if (evaluationDecision) {
        this.updateForm(evaluationDecision);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const evaluationDecision = this.evaluationDecisionFormService.getEvaluationDecision(this.editForm);
    if (evaluationDecision.id !== null) {
      this.subscribeToSaveResponse(this.evaluationDecisionService.update(evaluationDecision));
    } else {
      this.subscribeToSaveResponse(this.evaluationDecisionService.create(evaluationDecision));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IEvaluationDecision>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(evaluationDecision: IEvaluationDecision): void {
    this.evaluationDecision = evaluationDecision;
    this.evaluationDecisionFormService.resetForm(this.editForm, evaluationDecision);

    this.extendedUsersSharedCollection = this.extendedUserService.addExtendedUserToCollectionIfMissing<IExtendedUser>(
      this.extendedUsersSharedCollection,
      evaluationDecision.owner,
    );
    this.lifeEvaluationsSharedCollection = this.lifeEvaluationService.addLifeEvaluationToCollectionIfMissing<ILifeEvaluation>(
      this.lifeEvaluationsSharedCollection,
      evaluationDecision.lifeEvaluation,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.extendedUserService
      .query()
      .pipe(map((res: HttpResponse<IExtendedUser[]>) => res.body ?? []))
      .pipe(
        map((extendedUsers: IExtendedUser[]) =>
          this.extendedUserService.addExtendedUserToCollectionIfMissing<IExtendedUser>(extendedUsers, this.evaluationDecision?.owner),
        ),
      )
      .subscribe((extendedUsers: IExtendedUser[]) => (this.extendedUsersSharedCollection = extendedUsers));

    this.lifeEvaluationService
      .query()
      .pipe(map((res: HttpResponse<ILifeEvaluation[]>) => res.body ?? []))
      .pipe(
        map((lifeEvaluations: ILifeEvaluation[]) =>
          this.lifeEvaluationService.addLifeEvaluationToCollectionIfMissing<ILifeEvaluation>(
            lifeEvaluations,
            this.evaluationDecision?.lifeEvaluation,
          ),
        ),
      )
      .subscribe((lifeEvaluations: ILifeEvaluation[]) => (this.lifeEvaluationsSharedCollection = lifeEvaluations));
  }
}
