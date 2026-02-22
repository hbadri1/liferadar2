import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { SubLifePillarItemTranslationDetailComponent } from './sub-life-pillar-item-translation-detail.component';

describe('SubLifePillarItemTranslation Management Detail Component', () => {
  let comp: SubLifePillarItemTranslationDetailComponent;
  let fixture: ComponentFixture<SubLifePillarItemTranslationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubLifePillarItemTranslationDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () =>
                import('./sub-life-pillar-item-translation-detail.component').then(m => m.SubLifePillarItemTranslationDetailComponent),
              resolve: { subLifePillarItemTranslation: () => of({ id: 28830 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(SubLifePillarItemTranslationDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubLifePillarItemTranslationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load subLifePillarItemTranslation on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', SubLifePillarItemTranslationDetailComponent);

      // THEN
      expect(instance.subLifePillarItemTranslation()).toEqual(expect.objectContaining({ id: 28830 }));
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
