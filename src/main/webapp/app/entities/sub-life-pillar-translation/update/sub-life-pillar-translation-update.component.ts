import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ISubLifePillar } from 'app/entities/sub-life-pillar/sub-life-pillar.model';
import { SubLifePillarService } from 'app/entities/sub-life-pillar/service/sub-life-pillar.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';
import { SubLifePillarTranslationService } from '../service/sub-life-pillar-translation.service';
import { ISubLifePillarTranslation } from '../sub-life-pillar-translation.model';
import { SubLifePillarTranslationFormGroup, SubLifePillarTranslationFormService } from './sub-life-pillar-translation-form.service';

@Component({
  selector: 'jhi-sub-life-pillar-translation-update',
  templateUrl: './sub-life-pillar-translation-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubLifePillarTranslationUpdateComponent implements OnInit {
  isSaving = false;
  subLifePillarTranslation: ISubLifePillarTranslation | null = null;
  langCodeValues = Object.keys(LangCode);

  subLifePillarsSharedCollection: ISubLifePillar[] = [];

  protected subLifePillarTranslationService = inject(SubLifePillarTranslationService);
  protected subLifePillarTranslationFormService = inject(SubLifePillarTranslationFormService);
  protected subLifePillarService = inject(SubLifePillarService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SubLifePillarTranslationFormGroup = this.subLifePillarTranslationFormService.createSubLifePillarTranslationFormGroup();

  compareSubLifePillar = (o1: ISubLifePillar | null, o2: ISubLifePillar | null): boolean =>
    this.subLifePillarService.compareSubLifePillar(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ subLifePillarTranslation }) => {
      this.subLifePillarTranslation = subLifePillarTranslation;
      if (subLifePillarTranslation) {
        this.updateForm(subLifePillarTranslation);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const subLifePillarTranslation = this.subLifePillarTranslationFormService.getSubLifePillarTranslation(this.editForm);
    if (subLifePillarTranslation.id !== null) {
      this.subscribeToSaveResponse(this.subLifePillarTranslationService.update(subLifePillarTranslation));
    } else {
      this.subscribeToSaveResponse(this.subLifePillarTranslationService.create(subLifePillarTranslation));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISubLifePillarTranslation>>): void {
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

  protected updateForm(subLifePillarTranslation: ISubLifePillarTranslation): void {
    this.subLifePillarTranslation = subLifePillarTranslation;
    this.subLifePillarTranslationFormService.resetForm(this.editForm, subLifePillarTranslation);

    this.subLifePillarsSharedCollection = this.subLifePillarService.addSubLifePillarToCollectionIfMissing<ISubLifePillar>(
      this.subLifePillarsSharedCollection,
      subLifePillarTranslation.subLifePillar,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.subLifePillarService
      .query()
      .pipe(map((res: HttpResponse<ISubLifePillar[]>) => res.body ?? []))
      .pipe(
        map((subLifePillars: ISubLifePillar[]) =>
          this.subLifePillarService.addSubLifePillarToCollectionIfMissing<ISubLifePillar>(
            subLifePillars,
            this.subLifePillarTranslation?.subLifePillar,
          ),
        ),
      )
      .subscribe((subLifePillars: ISubLifePillar[]) => (this.subLifePillarsSharedCollection = subLifePillars));
  }
}
