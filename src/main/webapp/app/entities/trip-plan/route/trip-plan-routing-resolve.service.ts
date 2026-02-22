import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITripPlan } from '../trip-plan.model';
import { TripPlanService } from '../service/trip-plan.service';

const tripPlanResolve = (route: ActivatedRouteSnapshot): Observable<null | ITripPlan> => {
  const id = route.params.id;
  if (id) {
    return inject(TripPlanService)
      .find(id)
      .pipe(
        mergeMap((tripPlan: HttpResponse<ITripPlan>) => {
          if (tripPlan.body) {
            return of(tripPlan.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default tripPlanResolve;
