import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ISubPillar } from 'app/entities/sub-pillar/sub-pillar.model';
import { SubPillarService } from 'app/entities/sub-pillar/service/sub-pillar.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';
import { SubPillarTranslationService } from '../service/sub-pillar-translation.service';
import { ISubPillarTranslation } from '../sub-pillar-translation.model';
import { SubPillarTranslationFormGroup, SubPillarTranslationFormService } from './sub-pillar-translation-form.service';

@Component({
  selector: 'jhi-sub-pillar-translation-update',
  templateUrl: './sub-pillar-translation-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubPillarTranslationUpdateComponent implements OnInit {
  isSaving = false;
  subPillarTranslation: ISubPillarTranslation | null = null;
  langCodeValues = Object.keys(LangCode);

  subPillarsSharedCollection: ISubPillar[] = [];

  protected subPillarTranslationService = inject(SubPillarTranslationService);
  protected subPillarTranslationFormService = inject(SubPillarTranslationFormService);
  protected subPillarService = inject(SubPillarService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SubPillarTranslationFormGroup = this.subPillarTranslationFormService.createSubPillarTranslationFormGroup();

  compareSubPillar = (o1: ISubPillar | null, o2: ISubPillar | null): boolean =>
    this.subPillarService.compareSubPillar(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ subPillarTranslation }) => {
      this.subPillarTranslation = subPillarTranslation;
      if (subPillarTranslation) {
        this.updateForm(subPillarTranslation);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const subPillarTranslation = this.subPillarTranslationFormService.getSubPillarTranslation(this.editForm);
    if (subPillarTranslation.id !== null) {
      this.subscribeToSaveResponse(this.subPillarTranslationService.update(subPillarTranslation));
    } else {
      this.subscribeToSaveResponse(this.subPillarTranslationService.create(subPillarTranslation));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISubPillarTranslation>>): void {
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

  protected updateForm(subPillarTranslation: ISubPillarTranslation): void {
    this.subPillarTranslation = subPillarTranslation;
    this.subPillarTranslationFormService.resetForm(this.editForm, subPillarTranslation);

    this.subPillarsSharedCollection = this.subPillarService.addSubPillarToCollectionIfMissing<ISubPillar>(
      this.subPillarsSharedCollection,
      subPillarTranslation.subPillar,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.subPillarService
      .query()
      .pipe(map((res: HttpResponse<ISubPillar[]>) => res.body ?? []))
      .pipe(
        map((subPillars: ISubPillar[]) =>
          this.subPillarService.addSubPillarToCollectionIfMissing<ISubPillar>(
            subPillars,
            this.subPillarTranslation?.subPillar,
          ),
        ),
      )
      .subscribe((subPillars: ISubPillar[]) => (this.subPillarsSharedCollection = subPillars));
  }
}
