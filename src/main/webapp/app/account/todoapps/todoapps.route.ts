import { Route } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import TodoAppsComponent from './todoapps.component';

const todoAppsRoute: Route = {
  path: 'configuration',
  component: TodoAppsComponent,
  title: 'global.menu.account.configuration',
  canActivate: [UserRouteAccessService],
};

export default todoAppsRoute;

