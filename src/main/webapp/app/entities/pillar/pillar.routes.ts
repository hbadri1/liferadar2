import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import PillarResolve from './route/pillar-routing-resolve.service';

const pillarRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/pillar.component').then(m => m.PillarComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/pillar-detail.component').then(m => m.PillarDetailComponent),
    resolve: {
      pillar: PillarResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/pillar-update.component').then(m => m.PillarUpdateComponent),
    resolve: {
      pillar: PillarResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/pillar-update.component').then(m => m.PillarUpdateComponent),
    resolve: {
      pillar: PillarResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default pillarRoute;
