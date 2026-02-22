import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ITripPlan } from 'app/entities/trip-plan/trip-plan.model';
import { TripPlanService } from 'app/entities/trip-plan/service/trip-plan.service';
import { ITripPlanStep } from '../trip-plan-step.model';
import { TripPlanStepService } from '../service/trip-plan-step.service';
import { TripPlanStepFormGroup, TripPlanStepFormService } from './trip-plan-step-form.service';

@Component({
  selector: 'jhi-trip-plan-step-update',
  templateUrl: './trip-plan-step-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TripPlanStepUpdateComponent implements OnInit {
  isSaving = false;
  tripPlanStep: ITripPlanStep | null = null;

  tripPlansSharedCollection: ITripPlan[] = [];

  protected tripPlanStepService = inject(TripPlanStepService);
  protected tripPlanStepFormService = inject(TripPlanStepFormService);
  protected tripPlanService = inject(TripPlanService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TripPlanStepFormGroup = this.tripPlanStepFormService.createTripPlanStepFormGroup();

  compareTripPlan = (o1: ITripPlan | null, o2: ITripPlan | null): boolean => this.tripPlanService.compareTripPlan(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ tripPlanStep }) => {
      this.tripPlanStep = tripPlanStep;
      if (tripPlanStep) {
        this.updateForm(tripPlanStep);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const tripPlanStep = this.tripPlanStepFormService.getTripPlanStep(this.editForm);
    if (tripPlanStep.id !== null) {
      this.subscribeToSaveResponse(this.tripPlanStepService.update(tripPlanStep));
    } else {
      this.subscribeToSaveResponse(this.tripPlanStepService.create(tripPlanStep));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITripPlanStep>>): void {
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

  protected updateForm(tripPlanStep: ITripPlanStep): void {
    this.tripPlanStep = tripPlanStep;
    this.tripPlanStepFormService.resetForm(this.editForm, tripPlanStep);

    this.tripPlansSharedCollection = this.tripPlanService.addTripPlanToCollectionIfMissing<ITripPlan>(
      this.tripPlansSharedCollection,
      tripPlanStep.tripPlan,
    );
  }

  protected loadRelationshipsOptions(): void {
    this.tripPlanService
      .query()
      .pipe(map((res: HttpResponse<ITripPlan[]>) => res.body ?? []))
      .pipe(
        map((tripPlans: ITripPlan[]) =>
          this.tripPlanService.addTripPlanToCollectionIfMissing<ITripPlan>(tripPlans, this.tripPlanStep?.tripPlan),
        ),
      )
      .subscribe((tripPlans: ITripPlan[]) => (this.tripPlansSharedCollection = tripPlans));
  }
}
