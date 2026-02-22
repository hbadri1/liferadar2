import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISubLifePillar } from '../sub-life-pillar.model';
import { SubLifePillarService } from '../service/sub-life-pillar.service';

const subLifePillarResolve = (route: ActivatedRouteSnapshot): Observable<null | ISubLifePillar> => {
  const id = route.params.id;
  if (id) {
    return inject(SubLifePillarService)
      .find(id)
      .pipe(
        mergeMap((subLifePillar: HttpResponse<ISubLifePillar>) => {
          if (subLifePillar.body) {
            return of(subLifePillar.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default subLifePillarResolve;
