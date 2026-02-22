import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import LifeEvaluationResolve from './route/life-evaluation-routing-resolve.service';

const lifeEvaluationRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/life-evaluation.component').then(m => m.LifeEvaluationComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/life-evaluation-detail.component').then(m => m.LifeEvaluationDetailComponent),
    resolve: {
      lifeEvaluation: LifeEvaluationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/life-evaluation-update.component').then(m => m.LifeEvaluationUpdateComponent),
    resolve: {
      lifeEvaluation: LifeEvaluationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/life-evaluation-update.component').then(m => m.LifeEvaluationUpdateComponent),
    resolve: {
      lifeEvaluation: LifeEvaluationResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default lifeEvaluationRoute;
