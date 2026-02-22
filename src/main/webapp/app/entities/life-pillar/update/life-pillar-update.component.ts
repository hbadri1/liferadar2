import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { ILifePillar } from '../life-pillar.model';
import { LifePillarService } from '../service/life-pillar.service';
import { LifePillarFormGroup, LifePillarFormService } from './life-pillar-form.service';

@Component({
  selector: 'jhi-life-pillar-update',
  templateUrl: './life-pillar-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LifePillarUpdateComponent implements OnInit {
  isSaving = false;
  lifePillar: ILifePillar | null = null;

  extendedUsersSharedCollection: IExtendedUser[] = [];

  protected lifePillarService = inject(LifePillarService);
  protected lifePillarFormService = inject(LifePillarFormService);
  protected extendedUserService = inject(ExtendedUserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LifePillarFormGroup = this.lifePillarFormService.createLifePillarFormGroup();

  compareExtendedUser = (o1: IExtendedUser | null, o2: IExtendedUser | null): boolean =>
    this.extendedUserService.compareExtendedUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ lifePillar }) => {
      this.lifePillar = lifePillar;
      if (lifePillar) {
        this.updateForm(lifePillar);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const lifePillar = this.lifePillarFormService.getLifePillar(this.editForm);
    if (lifePillar.id !== null) {
      this.subscribeToSaveResponse(this.lifePillarService.update(lifePillar));
    } else {
      this.subscribeToSaveResponse(this.lifePillarService.create(lifePillar));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ILifePillar>>): void {
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

  protected updateForm(lifePillar: ILifePillar): void {
    this.lifePillar = lifePillar;
    this.lifePillarFormService.resetForm(this.editForm, lifePillar);

    this.extendedUsersSharedCollection = this.extendedUserService.addExtendedUserToCollectionIfMissing<IExtendedUser>(
      this.extendedUsersSharedCollection,
      lifePillar.owner,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.extendedUserService
      .query()
      .pipe(map((res: HttpResponse<IExtendedUser[]>) => res.body ?? []))
      .pipe(
        map((extendedUsers: IExtendedUser[]) =>
          this.extendedUserService.addExtendedUserToCollectionIfMissing<IExtendedUser>(extendedUsers, this.lifePillar?.owner),
        ),
      )
      .subscribe((extendedUsers: IExtendedUser[]) => (this.extendedUsersSharedCollection = extendedUsers));
  }
}
