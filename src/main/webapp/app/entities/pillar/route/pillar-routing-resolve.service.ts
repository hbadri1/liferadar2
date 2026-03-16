import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPillar } from '../pillar.model';
import { PillarService } from '../service/pillar.service';

const pillarResolve = (route: ActivatedRouteSnapshot): Observable<null | IPillar> => {
  const id = route.params.id;
  if (id) {
    return inject(PillarService)
      .find(id)
      .pipe(
        mergeMap((pillar: HttpResponse<IPillar>) => {
          if (pillar.body) {
            return of(pillar.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default pillarResolve;
