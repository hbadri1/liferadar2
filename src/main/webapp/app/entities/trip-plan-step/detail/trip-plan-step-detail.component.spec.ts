import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { TripPlanStepDetailComponent } from './trip-plan-step-detail.component';

describe('TripPlanStep Management Detail Component', () => {
  let comp: TripPlanStepDetailComponent;
  let fixture: ComponentFixture<TripPlanStepDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripPlanStepDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./trip-plan-step-detail.component').then(m => m.TripPlanStepDetailComponent),
              resolve: { tripPlanStep: () => of({ id: 5952 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(TripPlanStepDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TripPlanStepDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load tripPlanStep on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', TripPlanStepDetailComponent);

      // THEN
      expect(instance.tripPlanStep()).toEqual(expect.objectContaining({ id: 5952 }));
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
