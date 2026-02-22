import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { SubLifePillarTranslationDetailComponent } from './sub-life-pillar-translation-detail.component';

describe('SubLifePillarTranslation Management Detail Component', () => {
  let comp: SubLifePillarTranslationDetailComponent;
  let fixture: ComponentFixture<SubLifePillarTranslationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubLifePillarTranslationDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () =>
                import('./sub-life-pillar-translation-detail.component').then(m => m.SubLifePillarTranslationDetailComponent),
              resolve: { subLifePillarTranslation: () => of({ id: 7484 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(SubLifePillarTranslationDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubLifePillarTranslationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load subLifePillarTranslation on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', SubLifePillarTranslationDetailComponent);

      // THEN
      expect(instance.subLifePillarTranslation()).toEqual(expect.objectContaining({ id: 7484 }));
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
