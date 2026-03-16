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
    path: 'pillar',
    data: { pageTitle: 'liferadarApp.pillar.home.title' },
    loadChildren: () => import('./pillar/pillar.routes'),
  },
  {
    path: 'pillar-translation',
    data: { pageTitle: 'liferadarApp.pillarTranslation.home.title' },
    loadChildren: () => import('./pillar-translation/pillar-translation.routes'),
  },
  {
    path: 'sub-pillar',
    data: { pageTitle: 'liferadarApp.subPillar.home.title' },
    loadChildren: () => import('./sub-pillar/sub-pillar.routes'),
  },
  {
    path: 'sub-pillar-translation',
    data: { pageTitle: 'liferadarApp.subPillarTranslation.home.title' },
    loadChildren: () => import('./sub-pillar-translation/sub-pillar-translation.routes'),
  },
  {
    path: 'sub-pillar-item',
    data: { pageTitle: 'liferadarApp.subPillarItem.home.title' },
    loadChildren: () => import('./sub-pillar-item/sub-pillar-item.routes'),
  },
  {
    path: 'sub-pillar-item-translation',
    data: { pageTitle: 'liferadarApp.subPillarItemTranslation.home.title' },
    loadChildren: () => import('./sub-pillar-item-translation/sub-pillar-item-translation.routes'),
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
