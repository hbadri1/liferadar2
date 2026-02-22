import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import LifePillarResolve from './route/life-pillar-routing-resolve.service';

const lifePillarRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/life-pillar.component').then(m => m.LifePillarComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/life-pillar-detail.component').then(m => m.LifePillarDetailComponent),
    resolve: {
      lifePillar: LifePillarResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/life-pillar-update.component').then(m => m.LifePillarUpdateComponent),
    resolve: {
      lifePillar: LifePillarResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/life-pillar-update.component').then(m => m.LifePillarUpdateComponent),
    resolve: {
      lifePillar: LifePillarResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default lifePillarRoute;
