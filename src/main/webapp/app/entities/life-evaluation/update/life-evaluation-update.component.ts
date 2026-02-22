import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { ISubLifePillarItem } from 'app/entities/sub-life-pillar-item/sub-life-pillar-item.model';
import { SubLifePillarItemService } from 'app/entities/sub-life-pillar-item/service/sub-life-pillar-item.service';
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

  extendedUsersSharedCollection: IExtendedUser[] = [];
  subLifePillarItemsSharedCollection: ISubLifePillarItem[] = [];

  protected lifeEvaluationService = inject(LifeEvaluationService);
  protected lifeEvaluationFormService = inject(LifeEvaluationFormService);
  protected extendedUserService = inject(ExtendedUserService);
  protected subLifePillarItemService = inject(SubLifePillarItemService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LifeEvaluationFormGroup = this.lifeEvaluationFormService.createLifeEvaluationFormGroup();

  compareExtendedUser = (o1: IExtendedUser | null, o2: IExtendedUser | null): boolean =>
    this.extendedUserService.compareExtendedUser(o1, o2);

  compareSubLifePillarItem = (o1: ISubLifePillarItem | null, o2: ISubLifePillarItem | null): boolean =>
    this.subLifePillarItemService.compareSubLifePillarItem(o1, o2);

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

    this.extendedUsersSharedCollection = this.extendedUserService.addExtendedUserToCollectionIfMissing<IExtendedUser>(
      this.extendedUsersSharedCollection,
      lifeEvaluation.owner,
    );
    this.subLifePillarItemsSharedCollection = this.subLifePillarItemService.addSubLifePillarItemToCollectionIfMissing<ISubLifePillarItem>(
      this.subLifePillarItemsSharedCollection,
      lifeEvaluation.subLifePillarItem,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.extendedUserService
      .query()
      .pipe(map((res: HttpResponse<IExtendedUser[]>) => res.body ?? []))
      .pipe(
        map((extendedUsers: IExtendedUser[]) =>
          this.extendedUserService.addExtendedUserToCollectionIfMissing<IExtendedUser>(extendedUsers, this.lifeEvaluation?.owner),
        ),
      )
      .subscribe((extendedUsers: IExtendedUser[]) => (this.extendedUsersSharedCollection = extendedUsers));

    this.subLifePillarItemService
      .query()
      .pipe(map((res: HttpResponse<ISubLifePillarItem[]>) => res.body ?? []))
      .pipe(
        map((subLifePillarItems: ISubLifePillarItem[]) =>
          this.subLifePillarItemService.addSubLifePillarItemToCollectionIfMissing<ISubLifePillarItem>(
            subLifePillarItems,
            this.lifeEvaluation?.subLifePillarItem,
          ),
        ),
      )
      .subscribe((subLifePillarItems: ISubLifePillarItem[]) => (this.subLifePillarItemsSharedCollection = subLifePillarItems));
  }
}
