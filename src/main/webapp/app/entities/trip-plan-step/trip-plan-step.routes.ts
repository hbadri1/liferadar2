import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import TripPlanStepResolve from './route/trip-plan-step-routing-resolve.service';

const tripPlanStepRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/trip-plan-step.component').then(m => m.TripPlanStepComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/trip-plan-step-detail.component').then(m => m.TripPlanStepDetailComponent),
    resolve: {
      tripPlanStep: TripPlanStepResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/trip-plan-step-update.component').then(m => m.TripPlanStepUpdateComponent),
    resolve: {
      tripPlanStep: TripPlanStepResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/trip-plan-step-update.component').then(m => m.TripPlanStepUpdateComponent),
    resolve: {
      tripPlanStep: TripPlanStepResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default tripPlanStepRoute;
