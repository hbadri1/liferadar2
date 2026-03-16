import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { SubPillarItemDetailComponent } from './sub-pillar-item-detail.component';

describe('SubPillarItem Management Detail Component', () => {
  let comp: SubPillarItemDetailComponent;
  let fixture: ComponentFixture<SubPillarItemDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubPillarItemDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./sub-pillar-item-detail.component').then(m => m.SubPillarItemDetailComponent),
              resolve: { subPillarItem: () => of({ id: 7992 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(SubPillarItemDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubPillarItemDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load subPillarItem on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', SubPillarItemDetailComponent);

      // THEN
      expect(instance.subPillarItem()).toEqual(expect.objectContaining({ id: 7992 }));
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
