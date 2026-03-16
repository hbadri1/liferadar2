import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import SubPillarResolve from './route/sub-pillar-routing-resolve.service';

const subPillarRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/sub-pillar.component').then(m => m.SubPillarComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/sub-pillar-detail.component').then(m => m.SubPillarDetailComponent),
    resolve: {
      subPillar: SubPillarResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/sub-pillar-update.component').then(m => m.SubPillarUpdateComponent),
    resolve: {
      subPillar: SubPillarResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/sub-pillar-update.component').then(m => m.SubPillarUpdateComponent),
    resolve: {
      subPillar: SubPillarResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default subPillarRoute;
