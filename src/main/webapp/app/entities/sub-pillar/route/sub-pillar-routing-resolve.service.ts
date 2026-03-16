import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISubPillar } from '../sub-pillar.model';
import { SubPillarService } from '../service/sub-pillar.service';

const subPillarResolve = (route: ActivatedRouteSnapshot): Observable<null | ISubPillar> => {
  const id = route.params.id;
  if (id) {
    return inject(SubPillarService)
      .find(id)
      .pipe(
        mergeMap((subPillar: HttpResponse<ISubPillar>) => {
          if (subPillar.body) {
            return of(subPillar.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default subPillarResolve;
