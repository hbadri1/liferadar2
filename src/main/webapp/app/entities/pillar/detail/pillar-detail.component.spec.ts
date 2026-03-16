import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { PillarDetailComponent } from './pillar-detail.component';

describe('Pillar Management Detail Component', () => {
  let comp: PillarDetailComponent;
  let fixture: ComponentFixture<PillarDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PillarDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./pillar-detail.component').then(m => m.PillarDetailComponent),
              resolve: { pillar: () => of({ id: 15771 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(PillarDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PillarDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load pillar on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', PillarDetailComponent);

      // THEN
      expect(instance.pillar()).toEqual(expect.objectContaining({ id: 15771 }));
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
