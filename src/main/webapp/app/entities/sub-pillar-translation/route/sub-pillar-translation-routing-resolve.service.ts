import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ISubPillarTranslation } from '../sub-pillar-translation.model';
import { SubPillarTranslationService } from '../service/sub-pillar-translation.service';

const subPillarTranslationResolve = (route: ActivatedRouteSnapshot): Observable<null | ISubPillarTranslation> => {
  const id = route.params.id;
  if (id) {
    return inject(SubPillarTranslationService)
      .find(id)
      .pipe(
        mergeMap((subPillarTranslation: HttpResponse<ISubPillarTranslation>) => {
          if (subPillarTranslation.body) {
            return of(subPillarTranslation.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default subPillarTranslationResolve;
