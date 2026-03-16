import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { SubPillarDetailComponent } from './sub-pillar-detail.component';

describe('SubPillar Management Detail Component', () => {
  let comp: SubPillarDetailComponent;
  let fixture: ComponentFixture<SubPillarDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubPillarDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./sub-pillar-detail.component').then(m => m.SubPillarDetailComponent),
              resolve: { subPillar: () => of({ id: 23772 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(SubPillarDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubPillarDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load subPillar on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', SubPillarDetailComponent);

      // THEN
      expect(instance.subPillar()).toEqual(expect.objectContaining({ id: 23772 }));
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
