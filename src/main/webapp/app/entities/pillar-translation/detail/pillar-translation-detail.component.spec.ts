import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { PillarTranslationDetailComponent } from './pillar-translation-detail.component';

describe('PillarTranslation Management Detail Component', () => {
  let comp: PillarTranslationDetailComponent;
  let fixture: ComponentFixture<PillarTranslationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PillarTranslationDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./pillar-translation-detail.component').then(m => m.PillarTranslationDetailComponent),
              resolve: { pillarTranslation: () => of({ id: 22644 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(PillarTranslationDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PillarTranslationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load pillarTranslation on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', PillarTranslationDetailComponent);

      // THEN
      expect(instance.pillarTranslation()).toEqual(expect.objectContaining({ id: 22644 }));
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
