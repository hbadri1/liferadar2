import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IExtendedUser } from '../extended-user.model';
import { ExtendedUserService } from '../service/extended-user.service';

const extendedUserResolve = (route: ActivatedRouteSnapshot): Observable<null | IExtendedUser> => {
  const id = route.params.id;
  if (id) {
    return inject(ExtendedUserService)
      .find(id)
      .pipe(
        mergeMap((extendedUser: HttpResponse<IExtendedUser>) => {
          if (extendedUser.body) {
            return of(extendedUser.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default extendedUserResolve;
