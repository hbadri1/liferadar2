import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { ITripPlan } from '../trip-plan.model';
import { TripPlanService } from '../service/trip-plan.service';
import { TripPlanFormGroup, TripPlanFormService } from './trip-plan-form.service';

@Component({
  selector: 'jhi-trip-plan-update',
  templateUrl: './trip-plan-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TripPlanUpdateComponent implements OnInit {
  isSaving = false;
  tripPlan: ITripPlan | null = null;

  extendedUsersSharedCollection: IExtendedUser[] = [];

  protected tripPlanService = inject(TripPlanService);
  protected tripPlanFormService = inject(TripPlanFormService);
  protected extendedUserService = inject(ExtendedUserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TripPlanFormGroup = this.tripPlanFormService.createTripPlanFormGroup();

  compareExtendedUser = (o1: IExtendedUser | null, o2: IExtendedUser | null): boolean =>
    this.extendedUserService.compareExtendedUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ tripPlan }) => {
      this.tripPlan = tripPlan;
      if (tripPlan) {
        this.updateForm(tripPlan);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const tripPlan = this.tripPlanFormService.getTripPlan(this.editForm);
    if (tripPlan.id !== null) {
      this.subscribeToSaveResponse(this.tripPlanService.update(tripPlan));
    } else {
      this.subscribeToSaveResponse(this.tripPlanService.create(tripPlan));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITripPlan>>): void {
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

  protected updateForm(tripPlan: ITripPlan): void {
    this.tripPlan = tripPlan;
    this.tripPlanFormService.resetForm(this.editForm, tripPlan);

    this.extendedUsersSharedCollection = this.extendedUserService.addExtendedUserToCollectionIfMissing<IExtendedUser>(
      this.extendedUsersSharedCollection,
      tripPlan.owner,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.extendedUserService
      .query()
      .pipe(map((res: HttpResponse<IExtendedUser[]>) => res.body ?? []))
      .pipe(
        map((extendedUsers: IExtendedUser[]) =>
          this.extendedUserService.addExtendedUserToCollectionIfMissing<IExtendedUser>(extendedUsers, this.tripPlan?.owner),
        ),
      )
      .subscribe((extendedUsers: IExtendedUser[]) => (this.extendedUsersSharedCollection = extendedUsers));
  }
}
