import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ExtendedUserResolve from './route/extended-user-routing-resolve.service';

const extendedUserRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/extended-user.component').then(m => m.ExtendedUserComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/extended-user-detail.component').then(m => m.ExtendedUserDetailComponent),
    resolve: {
      extendedUser: ExtendedUserResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/extended-user-update.component').then(m => m.ExtendedUserUpdateComponent),
    resolve: {
      extendedUser: ExtendedUserResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/extended-user-update.component').then(m => m.ExtendedUserUpdateComponent),
    resolve: {
      extendedUser: ExtendedUserResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default extendedUserRoute;
