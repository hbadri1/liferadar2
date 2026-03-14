import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ISubLifePillar } from 'app/entities/sub-life-pillar/sub-life-pillar.model';
import { SubLifePillarService } from 'app/entities/sub-life-pillar/service/sub-life-pillar.service';
import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { ISubLifePillarItem } from '../sub-life-pillar-item.model';
import { SubLifePillarItemService } from '../service/sub-life-pillar-item.service';
import { SubLifePillarItemFormGroup, SubLifePillarItemFormService } from './sub-life-pillar-item-form.service';

@Component({
  selector: 'jhi-sub-life-pillar-item-update',
  templateUrl: './sub-life-pillar-item-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubLifePillarItemUpdateComponent implements OnInit {
  isSaving = false;
  subLifePillarItem: ISubLifePillarItem | null = null;

  subLifePillarsSharedCollection: ISubLifePillar[] = [];

  protected subLifePillarItemService = inject(SubLifePillarItemService);
  protected subLifePillarItemFormService = inject(SubLifePillarItemFormService);
  protected subLifePillarService = inject(SubLifePillarService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SubLifePillarItemFormGroup = this.subLifePillarItemFormService.createSubLifePillarItemFormGroup();

  compareSubLifePillar = (o1: ISubLifePillar | null, o2: ISubLifePillar | null): boolean =>
    this.subLifePillarService.compareSubLifePillar(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ subLifePillarItem }) => {
      this.subLifePillarItem = subLifePillarItem;
      if (subLifePillarItem) {
        this.updateForm(subLifePillarItem);
      }

      this.loadRelationshipsOptions();
      this.applySubLifePillarFromQueryParam();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const subLifePillarItem = this.subLifePillarItemFormService.getSubLifePillarItem(this.editForm);
    if (subLifePillarItem.id !== null) {
      this.subscribeToSaveResponse(this.subLifePillarItemService.update(subLifePillarItem));
    } else {
      this.subscribeToSaveResponse(this.subLifePillarItemService.create(subLifePillarItem));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ISubLifePillarItem>>): void {
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

  protected updateForm(subLifePillarItem: ISubLifePillarItem): void {
    this.subLifePillarItem = subLifePillarItem;
    this.subLifePillarItemFormService.resetForm(this.editForm, subLifePillarItem);

    this.subLifePillarsSharedCollection = this.subLifePillarService.addSubLifePillarToCollectionIfMissing<ISubLifePillar>(
      this.subLifePillarsSharedCollection,
      subLifePillarItem.subLifePillar,
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
            this.subLifePillarItem?.subLifePillar,
          ),
        ),
      )
      .subscribe((subLifePillars: ISubLifePillar[]) => (this.subLifePillarsSharedCollection = subLifePillars));
  }

  protected applySubLifePillarFromQueryParam(): void {
    const subLifePillarIdParam = this.activatedRoute.snapshot.queryParamMap.get('subLifePillarId');
    if (!subLifePillarIdParam || this.subLifePillarItem !== null) {
      return;
    }

    const subLifePillarId = Number(subLifePillarIdParam);
    if (Number.isNaN(subLifePillarId)) {
      return;
    }

    this.subLifePillarService.find(subLifePillarId).subscribe(({ body }) => {
      if (!body) {
        return;
      }

      this.editForm.patchValue({ subLifePillar: body });
      this.subLifePillarsSharedCollection = this.subLifePillarService.addSubLifePillarToCollectionIfMissing<ISubLifePillar>(
        this.subLifePillarsSharedCollection,
        body,
      );
    });
  }
}
