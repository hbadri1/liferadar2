import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IEvaluationDecision } from '../evaluation-decision.model';
import { EvaluationDecisionService } from '../service/evaluation-decision.service';

const evaluationDecisionResolve = (route: ActivatedRouteSnapshot): Observable<null | IEvaluationDecision> => {
  const id = route.params.id;
  if (id) {
    return inject(EvaluationDecisionService)
      .find(id)
      .pipe(
        mergeMap((evaluationDecision: HttpResponse<IEvaluationDecision>) => {
          if (evaluationDecision.body) {
            return of(evaluationDecision.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default evaluationDecisionResolve;
