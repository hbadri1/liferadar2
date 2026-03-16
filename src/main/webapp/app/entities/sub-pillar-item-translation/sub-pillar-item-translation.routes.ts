import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import SubPillarItemTranslationResolve from './route/sub-pillar-item-translation-routing-resolve.service';

const subPillarItemTranslationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/sub-pillar-item-translation.component').then(m => m.SubPillarItemTranslationComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () =>
      import('./detail/sub-pillar-item-translation-detail.component').then(m => m.SubPillarItemTranslationDetailComponent),
    resolve: {
      subPillarItemTranslation: SubPillarItemTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./update/sub-pillar-item-translation-update.component').then(m => m.SubPillarItemTranslationUpdateComponent),
    resolve: {
      subPillarItemTranslation: SubPillarItemTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./update/sub-pillar-item-translation-update.component').then(m => m.SubPillarItemTranslationUpdateComponent),
    resolve: {
      subPillarItemTranslation: SubPillarItemTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default subPillarItemTranslationRoute;
