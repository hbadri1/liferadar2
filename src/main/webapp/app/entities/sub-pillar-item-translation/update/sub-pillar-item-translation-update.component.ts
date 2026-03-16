import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ISubPillarItem } from 'app/entities/sub-pillar-item/sub-pillar-item.model';
import { SubPillarItemService } from 'app/entities/sub-pillar-item/service/sub-pillar-item.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';
import { SubPillarItemTranslationService } from '../service/sub-pillar-item-translation.service';
import { ISubPillarItemTranslation } from '../sub-pillar-item-translation.model';
import {
  SubPillarItemTranslationFormGroup,
  SubPillarItemTranslationFormService,
} from './sub-pillar-item-translation-form.service';

@Component({
  selector: 'jhi-sub-pillar-item-translation-update',
  templateUrl: './sub-pillar-item-translation-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubPillarItemTranslationUpdateComponent implements OnInit {
  isSaving = false;
  subPillarItemTranslation: ISubPillarItemTranslation | null = null;
  langCodeValues = Object.keys(LangCode);

  subPillarItemsSharedCollection: ISubPillarItem[] = [];

  protected subPillarItemTranslationService = inject(SubPillarItemTranslationService);
  protected subPillarItemTranslationFormService = inject(SubPillarItemTranslationFormService);
  protected subPillarItemService = inject(SubPillarItemService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SubPillarItemTranslationFormGroup =
    this.subPillarItemTranslationFormService.createSubPillarItemTranslationFormGroup();

  compareSubPillarItem = (o1: ISubPillarItem | null, o2: ISubPillarItem | null): boolean =>
    this.subPillarItemService.compareSubPillarItem(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ subPillarItemTranslation }) => {
      this.subPillarItemTranslation = subPillarItemTranslation;
      if (subPillarItemTranslation) {
        this.updateForm(subPillarItemTranslation);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const subPillarItemTranslation = this.subPillarItemTranslationFormService.getSubPillarItemTranslation(this.editForm);
    if (subPillarItemTranslation.id !== null) {
      this.subscribeToSaveResponse(this.subPillarItemTranslationService.update(subPillarItemTranslation));
    } else {
      this.subscribeToSaveResponse(this.subPillarItemTranslationService.create(subPillarItemTranslation));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISubPillarItemTranslation>>): void {
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

  protected updateForm(subPillarItemTranslation: ISubPillarItemTranslation): void {
    this.subPillarItemTranslation = subPillarItemTranslation;
    this.subPillarItemTranslationFormService.resetForm(this.editForm, subPillarItemTranslation);

    this.subPillarItemsSharedCollection = this.subPillarItemService.addSubPillarItemToCollectionIfMissing<ISubPillarItem>(
      this.subPillarItemsSharedCollection,
      subPillarItemTranslation.subPillarItem,
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
            this.subPillarItemTranslation?.subPillarItem,
          ),
        ),
      )
      .subscribe((subPillarItems: ISubPillarItem[]) => (this.subPillarItemsSharedCollection = subPillarItems));
  }
}
