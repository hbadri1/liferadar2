import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ILifePillar } from 'app/entities/life-pillar/life-pillar.model';
import { LifePillarService } from 'app/entities/life-pillar/service/life-pillar.service';
import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { ISubLifePillar } from '../sub-life-pillar.model';
import { SubLifePillarService } from '../service/sub-life-pillar.service';
import { SubLifePillarFormGroup, SubLifePillarFormService } from './sub-life-pillar-form.service';

@Component({
  selector: 'jhi-sub-life-pillar-update',
  templateUrl: './sub-life-pillar-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubLifePillarUpdateComponent implements OnInit {
  isSaving = false;
  subLifePillar: ISubLifePillar | null = null;

  lifePillarsSharedCollection: ILifePillar[] = [];

  protected subLifePillarService = inject(SubLifePillarService);
  protected subLifePillarFormService = inject(SubLifePillarFormService);
  protected lifePillarService = inject(LifePillarService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SubLifePillarFormGroup = this.subLifePillarFormService.createSubLifePillarFormGroup();

  compareLifePillar = (o1: ILifePillar | null, o2: ILifePillar | null): boolean =>
    this.lifePillarService.compareLifePillar(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ subLifePillar }) => {
      this.subLifePillar = subLifePillar;
      if (subLifePillar) {
        this.updateForm(subLifePillar);
      }

      this.loadRelationshipsOptions();
      this.applyLifePillarFromQueryParam();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const subLifePillar = this.subLifePillarFormService.getSubLifePillar(this.editForm);
    if (subLifePillar.id !== null) {
      this.subscribeToSaveResponse(this.subLifePillarService.update(subLifePillar));
    } else {
      this.subscribeToSaveResponse(this.subLifePillarService.create(subLifePillar));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISubLifePillar>>): void {
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

  protected updateForm(subLifePillar: ISubLifePillar): void {
    this.subLifePillar = subLifePillar;
    this.subLifePillarFormService.resetForm(this.editForm, subLifePillar);

    this.lifePillarsSharedCollection = this.lifePillarService.addLifePillarToCollectionIfMissing<ILifePillar>(
      this.lifePillarsSharedCollection,
      subLifePillar.lifePillar,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.lifePillarService
      .query()
      .pipe(map((res: HttpResponse<ILifePillar[]>) => res.body ?? []))
      .pipe(
        map((lifePillars: ILifePillar[]) =>
          this.lifePillarService.addLifePillarToCollectionIfMissing<ILifePillar>(
            lifePillars,
            this.subLifePillar?.lifePillar,
          ),
        ),
      )
      .subscribe((lifePillars: ILifePillar[]) => (this.lifePillarsSharedCollection = lifePillars));
  }

  protected applyLifePillarFromQueryParam(): void {
    const lifePillarIdParam = this.activatedRoute.snapshot.queryParamMap.get('lifePillarId');
    if (!lifePillarIdParam || this.subLifePillar !== null) {
      return;
    }

    const lifePillarId = Number(lifePillarIdParam);
    if (Number.isNaN(lifePillarId)) {
      return;
    }

    this.lifePillarService.find(lifePillarId).subscribe(({ body }) => {
      if (!body) {
        return;
      }

      this.editForm.patchValue({ lifePillar: body });
      this.lifePillarsSharedCollection = this.lifePillarService.addLifePillarToCollectionIfMissing<ILifePillar>(
        this.lifePillarsSharedCollection,
        body,
      );
    });
  }
}
