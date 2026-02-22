import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISubLifePillarTranslation } from '../sub-life-pillar-translation.model';
import { SubLifePillarTranslationService } from '../service/sub-life-pillar-translation.service';

const subLifePillarTranslationResolve = (route: ActivatedRouteSnapshot): Observable<null | ISubLifePillarTranslation> => {
  const id = route.params.id;
  if (id) {
    return inject(SubLifePillarTranslationService)
      .find(id)
      .pipe(
        mergeMap((subLifePillarTranslation: HttpResponse<ISubLifePillarTranslation>) => {
          if (subLifePillarTranslation.body) {
            return of(subLifePillarTranslation.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default subLifePillarTranslationResolve;
