import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IPillar } from 'app/entities/pillar/pillar.model';
import { PillarService } from 'app/entities/pillar/service/pillar.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';
import { PillarTranslationService } from '../service/pillar-translation.service';
import { IPillarTranslation } from '../pillar-translation.model';
import { PillarTranslationFormGroup, PillarTranslationFormService } from './pillar-translation-form.service';

@Component({
  selector: 'jhi-pillar-translation-update',
  templateUrl: './pillar-translation-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PillarTranslationUpdateComponent implements OnInit {
  isSaving = false;
  pillarTranslation: IPillarTranslation | null = null;
  langCodeValues = Object.keys(LangCode);

  pillarsSharedCollection: IPillar[] = [];

  protected pillarTranslationService = inject(PillarTranslationService);
  protected pillarTranslationFormService = inject(PillarTranslationFormService);
  protected pillarService = inject(PillarService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PillarTranslationFormGroup = this.pillarTranslationFormService.createPillarTranslationFormGroup();

  comparePillar = (o1: IPillar | null, o2: IPillar | null): boolean => this.pillarService.comparePillar(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ pillarTranslation }) => {
      this.pillarTranslation = pillarTranslation;
      if (pillarTranslation) {
        this.updateForm(pillarTranslation);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const pillarTranslation = this.pillarTranslationFormService.getPillarTranslation(this.editForm);
    if (pillarTranslation.id !== null) {
      this.subscribeToSaveResponse(this.pillarTranslationService.update(pillarTranslation));
    } else {
      this.subscribeToSaveResponse(this.pillarTranslationService.create(pillarTranslation));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPillarTranslation>>): void {
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

  protected updateForm(pillarTranslation: IPillarTranslation): void {
    this.pillarTranslation = pillarTranslation;
    this.pillarTranslationFormService.resetForm(this.editForm, pillarTranslation);

    this.pillarsSharedCollection = this.pillarService.addPillarToCollectionIfMissing<IPillar>(
      this.pillarsSharedCollection,
      pillarTranslation.pillar,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.pillarService
      .query()
      .pipe(map((res: HttpResponse<IPillar[]>) => res.body ?? []))
      .pipe(
        map((pillars: IPillar[]) =>
          this.pillarService.addPillarToCollectionIfMissing<IPillar>(pillars, this.pillarTranslation?.pillar),
        ),
      )
      .subscribe((pillars: IPillar[]) => (this.pillarsSharedCollection = pillars));
  }
}
