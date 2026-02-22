import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { SubLifePillarItemDetailComponent } from './sub-life-pillar-item-detail.component';

describe('SubLifePillarItem Management Detail Component', () => {
  let comp: SubLifePillarItemDetailComponent;
  let fixture: ComponentFixture<SubLifePillarItemDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubLifePillarItemDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./sub-life-pillar-item-detail.component').then(m => m.SubLifePillarItemDetailComponent),
              resolve: { subLifePillarItem: () => of({ id: 7992 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(SubLifePillarItemDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubLifePillarItemDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load subLifePillarItem on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', SubLifePillarItemDetailComponent);

      // THEN
      expect(instance.subLifePillarItem()).toEqual(expect.objectContaining({ id: 7992 }));
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
