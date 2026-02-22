import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { EvaluationDecisionDetailComponent } from './evaluation-decision-detail.component';

describe('EvaluationDecision Management Detail Component', () => {
  let comp: EvaluationDecisionDetailComponent;
  let fixture: ComponentFixture<EvaluationDecisionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluationDecisionDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./evaluation-decision-detail.component').then(m => m.EvaluationDecisionDetailComponent),
              resolve: { evaluationDecision: () => of({ id: 25936 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(EvaluationDecisionDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationDecisionDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load evaluationDecision on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', EvaluationDecisionDetailComponent);

      // THEN
      expect(instance.evaluationDecision()).toEqual(expect.objectContaining({ id: 25936 }));
    });
  });

  describe('PreviousState', () => {
    it('should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
