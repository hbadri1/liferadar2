import { Route } from '@angular/router';

import { Authority } from 'app/config/authority.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import SettingsComponent from '../settings/settings.component';

const kidProfileSettingsRoute: Route = {
  path: 'profile-settings',
  component: SettingsComponent,
  title: 'global.menu.account.profileSettings',
  data: {
    authorities: [Authority.CHILD],
  },
  canActivate: [UserRouteAccessService],
};

export default kidProfileSettingsRoute;
