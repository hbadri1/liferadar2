import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ISubLifePillarItem } from 'app/entities/sub-life-pillar-item/sub-life-pillar-item.model';
import { SubLifePillarItemService } from 'app/entities/sub-life-pillar-item/service/sub-life-pillar-item.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';
import { SubLifePillarItemTranslationService } from '../service/sub-life-pillar-item-translation.service';
import { ISubLifePillarItemTranslation } from '../sub-life-pillar-item-translation.model';
import {
  SubLifePillarItemTranslationFormGroup,
  SubLifePillarItemTranslationFormService,
} from './sub-life-pillar-item-translation-form.service';

@Component({
  selector: 'jhi-sub-life-pillar-item-translation-update',
  templateUrl: './sub-life-pillar-item-translation-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubLifePillarItemTranslationUpdateComponent implements OnInit {
  isSaving = false;
  subLifePillarItemTranslation: ISubLifePillarItemTranslation | null = null;
  langCodeValues = Object.keys(LangCode);

  subLifePillarItemsSharedCollection: ISubLifePillarItem[] = [];

  protected subLifePillarItemTranslationService = inject(SubLifePillarItemTranslationService);
  protected subLifePillarItemTranslationFormService = inject(SubLifePillarItemTranslationFormService);
  protected subLifePillarItemService = inject(SubLifePillarItemService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SubLifePillarItemTranslationFormGroup =
    this.subLifePillarItemTranslationFormService.createSubLifePillarItemTranslationFormGroup();

  compareSubLifePillarItem = (o1: ISubLifePillarItem | null, o2: ISubLifePillarItem | null): boolean =>
    this.subLifePillarItemService.compareSubLifePillarItem(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ subLifePillarItemTranslation }) => {
      this.subLifePillarItemTranslation = subLifePillarItemTranslation;
      if (subLifePillarItemTranslation) {
        this.updateForm(subLifePillarItemTranslation);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const subLifePillarItemTranslation = this.subLifePillarItemTranslationFormService.getSubLifePillarItemTranslation(this.editForm);
    if (subLifePillarItemTranslation.id !== null) {
      this.subscribeToSaveResponse(this.subLifePillarItemTranslationService.update(subLifePillarItemTranslation));
    } else {
      this.subscribeToSaveResponse(this.subLifePillarItemTranslationService.create(subLifePillarItemTranslation));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISubLifePillarItemTranslation>>): void {
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

  protected updateForm(subLifePillarItemTranslation: ISubLifePillarItemTranslation): void {
    this.subLifePillarItemTranslation = subLifePillarItemTranslation;
    this.subLifePillarItemTranslationFormService.resetForm(this.editForm, subLifePillarItemTranslation);

    this.subLifePillarItemsSharedCollection = this.subLifePillarItemService.addSubLifePillarItemToCollectionIfMissing<ISubLifePillarItem>(
      this.subLifePillarItemsSharedCollection,
      subLifePillarItemTranslation.subLifePillarItem,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.subLifePillarItemService
      .query()
      .pipe(map((res: HttpResponse<ISubLifePillarItem[]>) => res.body ?? []))
      .pipe(
        map((subLifePillarItems: ISubLifePillarItem[]) =>
          this.subLifePillarItemService.addSubLifePillarItemToCollectionIfMissing<ISubLifePillarItem>(
            subLifePillarItems,
            this.subLifePillarItemTranslation?.subLifePillarItem,
          ),
        ),
      )
      .subscribe((subLifePillarItems: ISubLifePillarItem[]) => (this.subLifePillarItemsSharedCollection = subLifePillarItems));
  }
}
