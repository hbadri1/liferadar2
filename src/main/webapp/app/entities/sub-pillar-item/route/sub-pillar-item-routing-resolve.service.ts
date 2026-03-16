import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISubPillarItem } from '../sub-pillar-item.model';
import { SubPillarItemService } from '../service/sub-pillar-item.service';

const subPillarItemResolve = (route: ActivatedRouteSnapshot): Observable<null | ISubPillarItem> => {
  const id = route.params.id;
  if (id) {
    return inject(SubPillarItemService)
      .find(id)
      .pipe(
        mergeMap((subPillarItem: HttpResponse<ISubPillarItem>) => {
          if (subPillarItem.body) {
            return of(subPillarItem.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default subPillarItemResolve;
