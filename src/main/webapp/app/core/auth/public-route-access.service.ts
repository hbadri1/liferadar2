import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { map } from 'rxjs/operators';

import { AccountService } from 'app/core/auth/account.service';

export const PublicRouteAccessService: CanActivateFn = (_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  return accountService.identity().pipe(
    map(account => {
      if (account) {
        router.navigate(['']);
        return false;
      }

      return true;
    }),
  );
};
