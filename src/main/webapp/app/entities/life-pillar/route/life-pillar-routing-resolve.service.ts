import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ILifePillar } from '../life-pillar.model';
import { LifePillarService } from '../service/life-pillar.service';

const lifePillarResolve = (route: ActivatedRouteSnapshot): Observable<null | ILifePillar> => {
  const id = route.params.id;
  if (id) {
    return inject(LifePillarService)
      .find(id)
      .pipe(
        mergeMap((lifePillar: HttpResponse<ILifePillar>) => {
          if (lifePillar.body) {
            return of(lifePillar.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default lifePillarResolve;
