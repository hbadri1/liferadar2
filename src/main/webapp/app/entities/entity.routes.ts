import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'liferadarApp.adminAuthority.home.title' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'extended-user',
    data: { pageTitle: 'liferadarApp.extendedUser.home.title' },
    loadChildren: () => import('./extended-user/extended-user.routes'),
  },
  {
    path: 'life-pillar',
    data: { pageTitle: 'liferadarApp.lifePillar.home.title' },
    loadChildren: () => import('./life-pillar/life-pillar.routes'),
  },
  {
    path: 'life-pillar-translation',
    data: { pageTitle: 'liferadarApp.lifePillarTranslation.home.title' },
    loadChildren: () => import('./life-pillar-translation/life-pillar-translation.routes'),
  },
  {
    path: 'sub-life-pillar',
    data: { pageTitle: 'liferadarApp.subLifePillar.home.title' },
    loadChildren: () => import('./sub-life-pillar/sub-life-pillar.routes'),
  },
  {
    path: 'sub-life-pillar-translation',
    data: { pageTitle: 'liferadarApp.subLifePillarTranslation.home.title' },
    loadChildren: () => import('./sub-life-pillar-translation/sub-life-pillar-translation.routes'),
  },
  {
    path: 'sub-life-pillar-item',
    data: { pageTitle: 'liferadarApp.subLifePillarItem.home.title' },
    loadChildren: () => import('./sub-life-pillar-item/sub-life-pillar-item.routes'),
  },
  {
    path: 'sub-life-pillar-item-translation',
    data: { pageTitle: 'liferadarApp.subLifePillarItemTranslation.home.title' },
    loadChildren: () => import('./sub-life-pillar-item-translation/sub-life-pillar-item-translation.routes'),
  },
  {
    path: 'life-evaluation',
    data: { pageTitle: 'liferadarApp.lifeEvaluation.home.title' },
    loadChildren: () => import('./life-evaluation/life-evaluation.routes'),
  },
  {
    path: 'evaluation-decision',
    data: { pageTitle: 'liferadarApp.evaluationDecision.home.title' },
    loadChildren: () => import('./evaluation-decision/evaluation-decision.routes'),
  },
  {
    path: 'trip-plan',
    data: { pageTitle: 'liferadarApp.tripPlan.home.title' },
    loadChildren: () => import('./trip-plan/trip-plan.routes'),
  },
  {
    path: 'trip-plan-step',
    data: { pageTitle: 'liferadarApp.tripPlanStep.home.title' },
    loadChildren: () => import('./trip-plan-step/trip-plan-step.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
