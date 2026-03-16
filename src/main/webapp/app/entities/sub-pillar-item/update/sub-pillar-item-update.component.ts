import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ISubPillar } from 'app/entities/sub-pillar/sub-pillar.model';
import { SubPillarService } from 'app/entities/sub-pillar/service/sub-pillar.service';
import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { ISubPillarItem } from '../sub-pillar-item.model';
import { SubPillarItemService } from '../service/sub-pillar-item.service';
import { SubPillarItemFormGroup, SubPillarItemFormService } from './sub-pillar-item-form.service';

@Component({
  selector: 'jhi-sub-pillar-item-update',
  templateUrl: './sub-pillar-item-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubPillarItemUpdateComponent implements OnInit {
  isSaving = false;
  subPillarItem: ISubPillarItem | null = null;

  subPillarsSharedCollection: ISubPillar[] = [];

  protected subPillarItemService = inject(SubPillarItemService);
  protected subPillarItemFormService = inject(SubPillarItemFormService);
  protected subPillarService = inject(SubPillarService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SubPillarItemFormGroup = this.subPillarItemFormService.createSubPillarItemFormGroup();

  compareSubPillar = (o1: ISubPillar | null, o2: ISubPillar | null): boolean =>
    this.subPillarService.compareSubPillar(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ subPillarItem }) => {
      this.subPillarItem = subPillarItem;
      if (subPillarItem) {
        this.updateForm(subPillarItem);
      }

      this.loadRelationshipsOptions();
      this.applySubPillarFromQueryParam();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const subPillarItem = this.subPillarItemFormService.getSubPillarItem(this.editForm);
    if (subPillarItem.id !== null) {
      this.subscribeToSaveResponse(this.subPillarItemService.update(subPillarItem));
    } else {
      this.subscribeToSaveResponse(this.subPillarItemService.create(subPillarItem));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISubPillarItem>>): void {
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

  protected updateForm(subPillarItem: ISubPillarItem): void {
    this.subPillarItem = subPillarItem;
    this.subPillarItemFormService.resetForm(this.editForm, subPillarItem);

    this.subPillarsSharedCollection = this.subPillarService.addSubPillarToCollectionIfMissing<ISubPillar>(
      this.subPillarsSharedCollection,
      subPillarItem.subPillar,
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
            this.subPillarItem?.subPillar,
          ),
        ),
      )
      .subscribe((subPillars: ISubPillar[]) => (this.subPillarsSharedCollection = subPillars));
  }

  protected applySubPillarFromQueryParam(): void {
    const subPillarIdParam = this.activatedRoute.snapshot.queryParamMap.get('subPillarId');
    if (!subPillarIdParam || this.subPillarItem !== null) {
      return;
    }

    const subPillarId = Number(subPillarIdParam);
    if (Number.isNaN(subPillarId)) {
      return;
    }

    this.subPillarService.find(subPillarId).subscribe(({ body }) => {
      if (!body) {
        return;
      }

      this.editForm.patchValue({ subPillar: body });
      this.subPillarsSharedCollection = this.subPillarService.addSubPillarToCollectionIfMissing<ISubPillar>(
        this.subPillarsSharedCollection,
        body,
      );
    });
  }
}
