import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import SubLifePillarItemResolve from './route/sub-life-pillar-item-routing-resolve.service';

const subLifePillarItemRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/sub-life-pillar-item.component').then(m => m.SubLifePillarItemComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/sub-life-pillar-item-detail.component').then(m => m.SubLifePillarItemDetailComponent),
    resolve: {
      subLifePillarItem: SubLifePillarItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/sub-life-pillar-item-update.component').then(m => m.SubLifePillarItemUpdateComponent),
    resolve: {
      subLifePillarItem: SubLifePillarItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/sub-life-pillar-item-update.component').then(m => m.SubLifePillarItemUpdateComponent),
    resolve: {
      subLifePillarItem: SubLifePillarItemResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default subLifePillarItemRoute;
