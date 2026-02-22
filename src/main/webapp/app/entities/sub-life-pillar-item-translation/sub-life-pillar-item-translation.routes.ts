import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import SubLifePillarItemTranslationResolve from './route/sub-life-pillar-item-translation-routing-resolve.service';

const subLifePillarItemTranslationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/sub-life-pillar-item-translation.component').then(m => m.SubLifePillarItemTranslationComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () =>
      import('./detail/sub-life-pillar-item-translation-detail.component').then(m => m.SubLifePillarItemTranslationDetailComponent),
    resolve: {
      subLifePillarItemTranslation: SubLifePillarItemTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./update/sub-life-pillar-item-translation-update.component').then(m => m.SubLifePillarItemTranslationUpdateComponent),
    resolve: {
      subLifePillarItemTranslation: SubLifePillarItemTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./update/sub-life-pillar-item-translation-update.component').then(m => m.SubLifePillarItemTranslationUpdateComponent),
    resolve: {
      subLifePillarItemTranslation: SubLifePillarItemTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default subLifePillarItemTranslationRoute;
