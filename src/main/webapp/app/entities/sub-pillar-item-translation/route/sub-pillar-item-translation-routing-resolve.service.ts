import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISubPillarItemTranslation } from '../sub-pillar-item-translation.model';
import { SubPillarItemTranslationService } from '../service/sub-pillar-item-translation.service';

const subPillarItemTranslationResolve = (route: ActivatedRouteSnapshot): Observable<null | ISubPillarItemTranslation> => {
  const id = route.params.id;
  if (id) {
    return inject(SubPillarItemTranslationService)
      .find(id)
      .pipe(
        mergeMap((subPillarItemTranslation: HttpResponse<ISubPillarItemTranslation>) => {
          if (subPillarItemTranslation.body) {
            return of(subPillarItemTranslation.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default subPillarItemTranslationResolve;
