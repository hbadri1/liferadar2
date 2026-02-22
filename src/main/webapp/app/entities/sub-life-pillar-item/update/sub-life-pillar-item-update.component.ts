import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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

  extendedUsersSharedCollection: IExtendedUser[] = [];

  protected subLifePillarItemService = inject(SubLifePillarItemService);
  protected subLifePillarItemFormService = inject(SubLifePillarItemFormService);
  protected extendedUserService = inject(ExtendedUserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SubLifePillarItemFormGroup = this.subLifePillarItemFormService.createSubLifePillarItemFormGroup();

  compareExtendedUser = (o1: IExtendedUser | null, o2: IExtendedUser | null): boolean =>
    this.extendedUserService.compareExtendedUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ subLifePillarItem }) => {
      this.subLifePillarItem = subLifePillarItem;
      if (subLifePillarItem) {
        this.updateForm(subLifePillarItem);
      }

      this.loadRelationshipsOptions();
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

    this.extendedUsersSharedCollection = this.extendedUserService.addExtendedUserToCollectionIfMissing<IExtendedUser>(
      this.extendedUsersSharedCollection,
      subLifePillarItem.owner,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.extendedUserService
      .query()
      .pipe(map((res: HttpResponse<IExtendedUser[]>) => res.body ?? []))
      .pipe(
        map((extendedUsers: IExtendedUser[]) =>
          this.extendedUserService.addExtendedUserToCollectionIfMissing<IExtendedUser>(extendedUsers, this.subLifePillarItem?.owner),
        ),
      )
      .subscribe((extendedUsers: IExtendedUser[]) => (this.extendedUsersSharedCollection = extendedUsers));
  }
}
