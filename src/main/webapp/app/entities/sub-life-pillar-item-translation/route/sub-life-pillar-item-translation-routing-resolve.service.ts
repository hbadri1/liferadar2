import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISubLifePillarItemTranslation } from '../sub-life-pillar-item-translation.model';
import { SubLifePillarItemTranslationService } from '../service/sub-life-pillar-item-translation.service';

const subLifePillarItemTranslationResolve = (route: ActivatedRouteSnapshot): Observable<null | ISubLifePillarItemTranslation> => {
  const id = route.params.id;
  if (id) {
    return inject(SubLifePillarItemTranslationService)
      .find(id)
      .pipe(
        mergeMap((subLifePillarItemTranslation: HttpResponse<ISubLifePillarItemTranslation>) => {
          if (subLifePillarItemTranslation.body) {
            return of(subLifePillarItemTranslation.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default subLifePillarItemTranslationResolve;
