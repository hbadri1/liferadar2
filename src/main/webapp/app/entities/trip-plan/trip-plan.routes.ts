import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import TripPlanResolve from './route/trip-plan-routing-resolve.service';

const tripPlanRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/trip-plan.component').then(m => m.TripPlanComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/trip-plan-detail.component').then(m => m.TripPlanDetailComponent),
    resolve: {
      tripPlan: TripPlanResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/trip-plan-update.component').then(m => m.TripPlanUpdateComponent),
    resolve: {
      tripPlan: TripPlanResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/trip-plan-update.component').then(m => m.TripPlanUpdateComponent),
    resolve: {
      tripPlan: TripPlanResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default tripPlanRoute;
