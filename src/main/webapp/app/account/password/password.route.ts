import { Route } from '@angular/router';

import { Authority } from 'app/config/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import PasswordComponent from './password.component';

const passwordRoute: Route = {
  path: 'password',
  component: PasswordComponent,
  title: 'global.menu.account.password',
  data: {
    authorities: [Authority.USER, Authority.ADMIN, Authority.FAMILY_ADMIN],
  },
  canActivate: [UserRouteAccessService],
};

export default passwordRoute;
