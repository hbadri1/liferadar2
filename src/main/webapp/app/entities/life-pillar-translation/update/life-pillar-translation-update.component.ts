import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ILifePillar } from 'app/entities/life-pillar/life-pillar.model';
import { LifePillarService } from 'app/entities/life-pillar/service/life-pillar.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';
import { LifePillarTranslationService } from '../service/life-pillar-translation.service';
import { ILifePillarTranslation } from '../life-pillar-translation.model';
import { LifePillarTranslationFormGroup, LifePillarTranslationFormService } from './life-pillar-translation-form.service';

@Component({
  selector: 'jhi-life-pillar-translation-update',
  templateUrl: './life-pillar-translation-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LifePillarTranslationUpdateComponent implements OnInit {
  isSaving = false;
  lifePillarTranslation: ILifePillarTranslation | null = null;
  langCodeValues = Object.keys(LangCode);

  lifePillarsSharedCollection: ILifePillar[] = [];

  protected lifePillarTranslationService = inject(LifePillarTranslationService);
  protected lifePillarTranslationFormService = inject(LifePillarTranslationFormService);
  protected lifePillarService = inject(LifePillarService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LifePillarTranslationFormGroup = this.lifePillarTranslationFormService.createLifePillarTranslationFormGroup();

  compareLifePillar = (o1: ILifePillar | null, o2: ILifePillar | null): boolean => this.lifePillarService.compareLifePillar(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ lifePillarTranslation }) => {
      this.lifePillarTranslation = lifePillarTranslation;
      if (lifePillarTranslation) {
        this.updateForm(lifePillarTranslation);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const lifePillarTranslation = this.lifePillarTranslationFormService.getLifePillarTranslation(this.editForm);
    if (lifePillarTranslation.id !== null) {
      this.subscribeToSaveResponse(this.lifePillarTranslationService.update(lifePillarTranslation));
    } else {
      this.subscribeToSaveResponse(this.lifePillarTranslationService.create(lifePillarTranslation));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILifePillarTranslation>>): void {
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

  protected updateForm(lifePillarTranslation: ILifePillarTranslation): void {
    this.lifePillarTranslation = lifePillarTranslation;
    this.lifePillarTranslationFormService.resetForm(this.editForm, lifePillarTranslation);

    this.lifePillarsSharedCollection = this.lifePillarService.addLifePillarToCollectionIfMissing<ILifePillar>(
      this.lifePillarsSharedCollection,
      lifePillarTranslation.lifePillar,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.lifePillarService
      .query()
      .pipe(map((res: HttpResponse<ILifePillar[]>) => res.body ?? []))
      .pipe(
        map((lifePillars: ILifePillar[]) =>
          this.lifePillarService.addLifePillarToCollectionIfMissing<ILifePillar>(lifePillars, this.lifePillarTranslation?.lifePillar),
        ),
      )
      .subscribe((lifePillars: ILifePillar[]) => (this.lifePillarsSharedCollection = lifePillars));
  }
}
