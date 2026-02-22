import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import SubLifePillarTranslationResolve from './route/sub-life-pillar-translation-routing-resolve.service';

const subLifePillarTranslationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/sub-life-pillar-translation.component').then(m => m.SubLifePillarTranslationComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () =>
      import('./detail/sub-life-pillar-translation-detail.component').then(m => m.SubLifePillarTranslationDetailComponent),
    resolve: {
      subLifePillarTranslation: SubLifePillarTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./update/sub-life-pillar-translation-update.component').then(m => m.SubLifePillarTranslationUpdateComponent),
    resolve: {
      subLifePillarTranslation: SubLifePillarTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./update/sub-life-pillar-translation-update.component').then(m => m.SubLifePillarTranslationUpdateComponent),
    resolve: {
      subLifePillarTranslation: SubLifePillarTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default subLifePillarTranslationRoute;
