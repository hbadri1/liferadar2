import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import LifePillarTranslationResolve from './route/life-pillar-translation-routing-resolve.service';

const lifePillarTranslationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/life-pillar-translation.component').then(m => m.LifePillarTranslationComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/life-pillar-translation-detail.component').then(m => m.LifePillarTranslationDetailComponent),
    resolve: {
      lifePillarTranslation: LifePillarTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/life-pillar-translation-update.component').then(m => m.LifePillarTranslationUpdateComponent),
    resolve: {
      lifePillarTranslation: LifePillarTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/life-pillar-translation-update.component').then(m => m.LifePillarTranslationUpdateComponent),
    resolve: {
      lifePillarTranslation: LifePillarTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default lifePillarTranslationRoute;
