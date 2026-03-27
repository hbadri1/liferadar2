import { Route } from '@angular/router';

import { Authority } from 'app/config/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import SettingsComponent from './settings.component';

const settingsRoute: Route = {
  path: 'settings',
  component: SettingsComponent,
  title: 'global.menu.account.settings',
  data: {
    authorities: [Authority.USER, Authority.ADMIN, Authority.FAMILY_ADMIN],
  },
  canActivate: [UserRouteAccessService],
};

export default settingsRoute;
