import { Route } from '@angular/router';

import { Authority } from 'app/config/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import TodoAppsComponent from './todoapps.component';

const todoAppsRoute: Route = {
  path: 'configuration',
  component: TodoAppsComponent,
  title: 'global.menu.account.configuration',
  data: {
    authorities: [Authority.USER, Authority.ADMIN, Authority.FAMILY_ADMIN],
  },
  canActivate: [UserRouteAccessService],
};

export default todoAppsRoute;

