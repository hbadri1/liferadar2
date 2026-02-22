import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITripPlanStep } from '../trip-plan-step.model';
import { TripPlanStepService } from '../service/trip-plan-step.service';

const tripPlanStepResolve = (route: ActivatedRouteSnapshot): Observable<null | ITripPlanStep> => {
  const id = route.params.id;
  if (id) {
    return inject(TripPlanStepService)
      .find(id)
      .pipe(
        mergeMap((tripPlanStep: HttpResponse<ITripPlanStep>) => {
          if (tripPlanStep.body) {
            return of(tripPlanStep.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default tripPlanStepResolve;
