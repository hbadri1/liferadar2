import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { LifeEvaluationDetailComponent } from './life-evaluation-detail.component';

describe('LifeEvaluation Management Detail Component', () => {
  let comp: LifeEvaluationDetailComponent;
  let fixture: ComponentFixture<LifeEvaluationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LifeEvaluationDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./life-evaluation-detail.component').then(m => m.LifeEvaluationDetailComponent),
              resolve: { lifeEvaluation: () => of({ id: 11329 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(LifeEvaluationDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LifeEvaluationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load lifeEvaluation on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', LifeEvaluationDetailComponent);

      // THEN
      expect(instance.lifeEvaluation()).toEqual(expect.objectContaining({ id: 11329 }));
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
