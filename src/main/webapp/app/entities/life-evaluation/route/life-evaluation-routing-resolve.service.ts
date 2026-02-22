import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ILifeEvaluation } from '../life-evaluation.model';
import { LifeEvaluationService } from '../service/life-evaluation.service';

const lifeEvaluationResolve = (route: ActivatedRouteSnapshot): Observable<null | ILifeEvaluation> => {
  const id = route.params.id;
  if (id) {
    return inject(LifeEvaluationService)
      .find(id)
      .pipe(
        mergeMap((lifeEvaluation: HttpResponse<ILifeEvaluation>) => {
          if (lifeEvaluation.body) {
            return of(lifeEvaluation.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default lifeEvaluationResolve;
