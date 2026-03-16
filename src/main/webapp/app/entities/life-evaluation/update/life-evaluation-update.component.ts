import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ISubPillarItem } from 'app/entities/sub-pillar-item/sub-pillar-item.model';
import { SubPillarItemService } from 'app/entities/sub-pillar-item/service/sub-pillar-item.service';
import { LifeEvaluationService } from '../service/life-evaluation.service';
import { ILifeEvaluation } from '../life-evaluation.model';
import { LifeEvaluationFormGroup, LifeEvaluationFormService } from './life-evaluation-form.service';

@Component({
  selector: 'jhi-life-evaluation-update',
  templateUrl: './life-evaluation-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LifeEvaluationUpdateComponent implements OnInit {
  isSaving = false;
  lifeEvaluation: ILifeEvaluation | null = null;
  readonly scoreOptions = [1, 2, 3, 4, 5];

  subPillarItemsSharedCollection: ISubPillarItem[] = [];

  protected lifeEvaluationService = inject(LifeEvaluationService);
  protected lifeEvaluationFormService = inject(LifeEvaluationFormService);
  protected subPillarItemService = inject(SubPillarItemService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LifeEvaluationFormGroup = this.lifeEvaluationFormService.createLifeEvaluationFormGroup();

  compareSubPillarItem = (o1: ISubPillarItem | null, o2: ISubPillarItem | null): boolean =>
    this.subPillarItemService.compareSubPillarItem(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ lifeEvaluation }) => {
      this.lifeEvaluation = lifeEvaluation;
      if (lifeEvaluation) {
        this.updateForm(lifeEvaluation);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const lifeEvaluation = this.lifeEvaluationFormService.getLifeEvaluation(this.editForm);
    if (lifeEvaluation.id !== null) {
      this.subscribeToSaveResponse(this.lifeEvaluationService.update(lifeEvaluation));
    } else {
      this.subscribeToSaveResponse(this.lifeEvaluationService.create(lifeEvaluation));
    }
  }

  selectScore(score: number): void {
    this.editForm.controls.score.setValue(score);
    this.editForm.controls.score.markAsTouched();
  }

  isScoreSelected(score: number): boolean {
    return this.editForm.controls.score.value === score;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILifeEvaluation>>): void {
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

  protected updateForm(lifeEvaluation: ILifeEvaluation): void {
    this.lifeEvaluation = lifeEvaluation;
    this.lifeEvaluationFormService.resetForm(this.editForm, lifeEvaluation);

    this.subPillarItemsSharedCollection = this.subPillarItemService.addSubPillarItemToCollectionIfMissing<ISubPillarItem>(
      this.subPillarItemsSharedCollection,
      lifeEvaluation.subPillarItem,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.subPillarItemService
      .query()
      .pipe(map((res: HttpResponse<ISubPillarItem[]>) => res.body ?? []))
      .pipe(
        map((subPillarItems: ISubPillarItem[]) =>
          this.subPillarItemService.addSubPillarItemToCollectionIfMissing<ISubPillarItem>(
            subPillarItems,
            this.lifeEvaluation?.subPillarItem,
          ),
        ),
      )
      .subscribe((subPillarItems: ISubPillarItem[]) => (this.subPillarItemsSharedCollection = subPillarItems));
  }
}
