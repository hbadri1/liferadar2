import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import SubPillarTranslationResolve from './route/sub-pillar-translation-routing-resolve.service';

const subPillarTranslationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/sub-pillar-translation.component').then(m => m.SubPillarTranslationComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () =>
      import('./detail/sub-pillar-translation-detail.component').then(m => m.SubPillarTranslationDetailComponent),
    resolve: {
      subPillarTranslation: SubPillarTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./update/sub-pillar-translation-update.component').then(m => m.SubPillarTranslationUpdateComponent),
    resolve: {
      subPillarTranslation: SubPillarTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./update/sub-pillar-translation-update.component').then(m => m.SubPillarTranslationUpdateComponent),
    resolve: {
      subPillarTranslation: SubPillarTranslationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default subPillarTranslationRoute;
