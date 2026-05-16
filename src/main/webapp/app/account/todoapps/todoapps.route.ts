import { Route } from '@angular/router';

import { Authority } from 'app/config/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

const todoAppsRoute: Route = {
  path: 'configuration',
  redirectTo: 'settings',
  pathMatch: 'full',
  title: 'global.menu.account.configuration',
  data: {
    authorities: [Authority.USER, Authority.ADMIN, Authority.PARENT],
  },
  canActivate: [UserRouteAccessService],
};

export default todoAppsRoute;
