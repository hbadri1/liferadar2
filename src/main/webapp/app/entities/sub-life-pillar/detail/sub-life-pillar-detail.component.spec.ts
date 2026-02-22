import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { SubLifePillarDetailComponent } from './sub-life-pillar-detail.component';

describe('SubLifePillar Management Detail Component', () => {
  let comp: SubLifePillarDetailComponent;
  let fixture: ComponentFixture<SubLifePillarDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubLifePillarDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./sub-life-pillar-detail.component').then(m => m.SubLifePillarDetailComponent),
              resolve: { subLifePillar: () => of({ id: 23772 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(SubLifePillarDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubLifePillarDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load subLifePillar on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', SubLifePillarDetailComponent);

      // THEN
      expect(instance.subLifePillar()).toEqual(expect.objectContaining({ id: 23772 }));
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
