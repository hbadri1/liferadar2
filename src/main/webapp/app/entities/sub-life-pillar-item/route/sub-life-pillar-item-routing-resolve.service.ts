import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISubLifePillarItem } from '../sub-life-pillar-item.model';
import { SubLifePillarItemService } from '../service/sub-life-pillar-item.service';

const subLifePillarItemResolve = (route: ActivatedRouteSnapshot): Observable<null | ISubLifePillarItem> => {
  const id = route.params.id;
  if (id) {
    return inject(SubLifePillarItemService)
      .find(id)
      .pipe(
        mergeMap((subLifePillarItem: HttpResponse<ISubLifePillarItem>) => {
          if (subLifePillarItem.body) {
            return of(subLifePillarItem.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default subLifePillarItemResolve;
