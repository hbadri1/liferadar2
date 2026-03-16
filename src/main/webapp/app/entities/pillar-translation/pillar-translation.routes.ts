import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import PillarTranslationResolve from './route/pillar-translation-routing-resolve.service';

const pillarTranslationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/pillar-translation.component').then(m => m.PillarTranslationComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/pillar-translation-detail.component').then(m => m.PillarTranslationDetailComponent),
    resolve: {
      pillarTranslation: PillarTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/pillar-translation-update.component').then(m => m.PillarTranslationUpdateComponent),
    resolve: {
      pillarTranslation: PillarTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/pillar-translation-update.component').then(m => m.PillarTranslationUpdateComponent),
    resolve: {
      pillarTranslation: PillarTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default pillarTranslationRoute;
