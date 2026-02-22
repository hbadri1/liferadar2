import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { LifePillarDetailComponent } from './life-pillar-detail.component';

describe('LifePillar Management Detail Component', () => {
  let comp: LifePillarDetailComponent;
  let fixture: ComponentFixture<LifePillarDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LifePillarDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./life-pillar-detail.component').then(m => m.LifePillarDetailComponent),
              resolve: { lifePillar: () => of({ id: 15771 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(LifePillarDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LifePillarDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load lifePillar on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', LifePillarDetailComponent);

      // THEN
      expect(instance.lifePillar()).toEqual(expect.objectContaining({ id: 15771 }));
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
