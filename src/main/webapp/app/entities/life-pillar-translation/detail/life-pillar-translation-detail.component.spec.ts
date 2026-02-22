import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { LifePillarTranslationDetailComponent } from './life-pillar-translation-detail.component';

describe('LifePillarTranslation Management Detail Component', () => {
  let comp: LifePillarTranslationDetailComponent;
  let fixture: ComponentFixture<LifePillarTranslationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LifePillarTranslationDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./life-pillar-translation-detail.component').then(m => m.LifePillarTranslationDetailComponent),
              resolve: { lifePillarTranslation: () => of({ id: 22644 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(LifePillarTranslationDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LifePillarTranslationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load lifePillarTranslation on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', LifePillarTranslationDetailComponent);

      // THEN
      expect(instance.lifePillarTranslation()).toEqual(expect.objectContaining({ id: 22644 }));
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
