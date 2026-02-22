import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import EvaluationDecisionResolve from './route/evaluation-decision-routing-resolve.service';

const evaluationDecisionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/evaluation-decision.component').then(m => m.EvaluationDecisionComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/evaluation-decision-detail.component').then(m => m.EvaluationDecisionDetailComponent),
    resolve: {
      evaluationDecision: EvaluationDecisionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/evaluation-decision-update.component').then(m => m.EvaluationDecisionUpdateComponent),
    resolve: {
      evaluationDecision: EvaluationDecisionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/evaluation-decision-update.component').then(m => m.EvaluationDecisionUpdateComponent),
    resolve: {
      evaluationDecision: EvaluationDecisionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default evaluationDecisionRoute;
