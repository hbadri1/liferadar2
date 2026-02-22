import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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

  extendedUsersSharedCollection: IExtendedUser[] = [];

  protected subLifePillarService = inject(SubLifePillarService);
  protected subLifePillarFormService = inject(SubLifePillarFormService);
  protected extendedUserService = inject(ExtendedUserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: SubLifePillarFormGroup = this.subLifePillarFormService.createSubLifePillarFormGroup();

  compareExtendedUser = (o1: IExtendedUser | null, o2: IExtendedUser | null): boolean =>
    this.extendedUserService.compareExtendedUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ subLifePillar }) => {
      this.subLifePillar = subLifePillar;
      if (subLifePillar) {
        this.updateForm(subLifePillar);
      }

      this.loadRelationshipsOptions();
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

    this.extendedUsersSharedCollection = this.extendedUserService.addExtendedUserToCollectionIfMissing<IExtendedUser>(
      this.extendedUsersSharedCollection,
      subLifePillar.owner,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.extendedUserService
      .query()
      .pipe(map((res: HttpResponse<IExtendedUser[]>) => res.body ?? []))
      .pipe(
        map((extendedUsers: IExtendedUser[]) =>
          this.extendedUserService.addExtendedUserToCollectionIfMissing<IExtendedUser>(extendedUsers, this.subLifePillar?.owner),
        ),
      )
      .subscribe((extendedUsers: IExtendedUser[]) => (this.extendedUsersSharedCollection = extendedUsers));
  }
}
