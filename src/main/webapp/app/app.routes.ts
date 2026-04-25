import { Routes } from '@angular/router';

import { Authority } from 'app/config/authority.constants';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import { errorRoute } from './layouts/error/error.route';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component'),
    title: 'home.title',
  },
  {
    path: '',
    loadComponent: () => import('./layouts/navbar/navbar.component'),
    outlet: 'navbar',
  },
  {
    path: 'admin',
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
    loadChildren: () => import('./admin/admin.routes'),
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.route'),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component'),
    title: 'login.title',
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.component'),
    title: 'about.title',
  },
  {
    path: 'action-items',
    loadComponent: () =>
      import('./entities/evaluation-decision/list/evaluation-decision.component').then(m => m.EvaluationDecisionComponent),
    title: 'global.menu.actionItems',
    data: {
      defaultSort: `date,${ASC}`,
      actionItems: true,
      authorities: [Authority.USER, Authority.ADMIN, Authority.FAMILY_ADMIN],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'family',
    loadComponent: () => import('./family/family.component'),
    title: 'family.title',
    data: {
      authorities: [Authority.USER, Authority.ADMIN, Authority.FAMILY_ADMIN, Authority.CHILD],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'trips',
    loadComponent: () => import('./trips/trips.component'),
    title: 'trips.title',
    data: {
      authorities: [Authority.USER, Authority.ADMIN, Authority.FAMILY_ADMIN, Authority.CHILD],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'expenses',
    loadComponent: () => import('./bills-subscriptions/bills-subscriptions.component'),
    title: 'billsSubscriptions.expensesTitle',
    data: {
      authorities: [Authority.USER, Authority.ADMIN, Authority.FAMILY_ADMIN],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'notifications',
    loadComponent: () => import('./notifications/notifications.component'),
    title: 'notifications.title',
    data: {
      authorities: [Authority.USER, Authority.ADMIN, Authority.FAMILY_ADMIN, Authority.CHILD],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'entities/expense/new',
    loadComponent: () => import('./entities/saas-subscription/create/saas-subscription-create.component'),
    title: 'billsSubscriptions.newExpense',
    data: {
      authorities: [Authority.USER, Authority.ADMIN, Authority.FAMILY_ADMIN],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: '',
    loadChildren: () => import(`./entities/entity.routes`),
  },
  ...errorRoute,
];

export default routes;
