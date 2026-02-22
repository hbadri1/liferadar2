import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ILifePillarTranslation } from '../life-pillar-translation.model';
import { LifePillarTranslationService } from '../service/life-pillar-translation.service';

const lifePillarTranslationResolve = (route: ActivatedRouteSnapshot): Observable<null | ILifePillarTranslation> => {
  const id = route.params.id;
  if (id) {
    return inject(LifePillarTranslationService)
      .find(id)
      .pipe(
        mergeMap((lifePillarTranslation: HttpResponse<ILifePillarTranslation>) => {
          if (lifePillarTranslation.body) {
            return of(lifePillarTranslation.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default lifePillarTranslationResolve;
