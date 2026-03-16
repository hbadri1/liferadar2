import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { SubPillarItemTranslationDetailComponent } from './sub-pillar-item-translation-detail.component';

describe('SubPillarItemTranslation Management Detail Component', () => {
  let comp: SubPillarItemTranslationDetailComponent;
  let fixture: ComponentFixture<SubPillarItemTranslationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubPillarItemTranslationDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () =>
                import('./sub-pillar-item-translation-detail.component').then(m => m.SubPillarItemTranslationDetailComponent),
              resolve: { subPillarItemTranslation: () => of({ id: 28830 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(SubPillarItemTranslationDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubPillarItemTranslationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load subPillarItemTranslation on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', SubPillarItemTranslationDetailComponent);

      // THEN
      expect(instance.subPillarItemTranslation()).toEqual(expect.objectContaining({ id: 28830 }));
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
