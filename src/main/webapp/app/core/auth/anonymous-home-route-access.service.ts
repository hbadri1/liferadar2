import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { AccountService } from './account.service';

export const AnonymousHomeRouteAccessService: CanMatchFn = () => {
  const accountService = inject(AccountService);
  const router = inject(Router);

  return accountService.identity().pipe(
    map(account => {
      if (account) {
        return router.parseUrl('/dashboard');
      }

      return true;
    }),
  );
};
