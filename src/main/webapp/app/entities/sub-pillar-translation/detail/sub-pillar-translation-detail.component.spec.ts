import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { SubPillarTranslationDetailComponent } from './sub-pillar-translation-detail.component';

describe('SubPillarTranslation Management Detail Component', () => {
  let comp: SubPillarTranslationDetailComponent;
  let fixture: ComponentFixture<SubPillarTranslationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubPillarTranslationDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () =>
                import('./sub-pillar-translation-detail.component').then(m => m.SubPillarTranslationDetailComponent),
              resolve: { subPillarTranslation: () => of({ id: 7484 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(SubPillarTranslationDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubPillarTranslationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load subPillarTranslation on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', SubPillarTranslationDetailComponent);

      // THEN
      expect(instance.subPillarTranslation()).toEqual(expect.objectContaining({ id: 7484 }));
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
