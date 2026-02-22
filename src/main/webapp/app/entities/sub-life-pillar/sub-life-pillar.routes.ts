import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import SubLifePillarResolve from './route/sub-life-pillar-routing-resolve.service';

const subLifePillarRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/sub-life-pillar.component').then(m => m.SubLifePillarComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/sub-life-pillar-detail.component').then(m => m.SubLifePillarDetailComponent),
    resolve: {
      subLifePillar: SubLifePillarResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/sub-life-pillar-update.component').then(m => m.SubLifePillarUpdateComponent),
    resolve: {
      subLifePillar: SubLifePillarResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/sub-life-pillar-update.component').then(m => m.SubLifePillarUpdateComponent),
    resolve: {
      subLifePillar: SubLifePillarResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default subLifePillarRoute;
