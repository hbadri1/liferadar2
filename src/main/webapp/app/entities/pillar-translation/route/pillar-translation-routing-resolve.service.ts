import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPillarTranslation } from '../pillar-translation.model';
import { PillarTranslationService } from '../service/pillar-translation.service';

const pillarTranslationResolve = (route: ActivatedRouteSnapshot): Observable<null | IPillarTranslation> => {
  const id = route.params.id;
  if (id) {
    return inject(PillarTranslationService)
      .find(id)
      .pipe(
        mergeMap((pillarTranslation: HttpResponse<IPillarTranslation>) => {
          if (pillarTranslation.body) {
            return of(pillarTranslation.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default pillarTranslationResolve;
