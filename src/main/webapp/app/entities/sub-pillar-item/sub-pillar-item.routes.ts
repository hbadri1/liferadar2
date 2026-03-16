import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import SubPillarItemResolve from './route/sub-pillar-item-routing-resolve.service';

const subPillarItemRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/sub-pillar-item.component').then(m => m.SubPillarItemComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/sub-pillar-item-detail.component').then(m => m.SubPillarItemDetailComponent),
    resolve: {
      subPillarItem: SubPillarItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/sub-pillar-item-update.component').then(m => m.SubPillarItemUpdateComponent),
    resolve: {
      subPillarItem: SubPillarItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/sub-pillar-item-update.component').then(m => m.SubPillarItemUpdateComponent),
    resolve: {
      subPillarItem: SubPillarItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default subPillarItemRoute;
