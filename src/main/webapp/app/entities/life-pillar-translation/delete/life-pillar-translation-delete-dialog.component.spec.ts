jest.mock('@ng-bootstrap/ng-bootstrap');

import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { LifePillarTranslationService } from '../service/life-pillar-translation.service';

import { LifePillarTranslationDeleteDialogComponent } from './life-pillar-translation-delete-dialog.component';

describe('LifePillarTranslation Management Delete Component', () => {
  let comp: LifePillarTranslationDeleteDialogComponent;
  let fixture: ComponentFixture<LifePillarTranslationDeleteDialogComponent>;
  let service: LifePillarTranslationService;
  let mockActiveModal: NgbActiveModal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LifePillarTranslationDeleteDialogComponent],
      providers: [provideHttpClient(), NgbActiveModal],
    })
      .overrideTemplate(LifePillarTranslationDeleteDialogComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(LifePillarTranslationDeleteDialogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(LifePillarTranslationService);
    mockActiveModal = TestBed.inject(NgbActiveModal);
  });

  describe('confirmDelete', () => {
    it('should call delete service on confirmDelete', inject(
      [],
      fakeAsync(() => {
        // GIVEN
        jest.spyOn(service, 'delete').mockReturnValue(of(new HttpResponse({ body: {} })));

        // WHEN
        comp.confirmDelete(123);
        tick();

        // THEN
        expect(service.delete).toHaveBeenCalledWith(123);
        expect(mockActiveModal.close).toHaveBeenCalledWith('deleted');
      }),
    ));

    it('should not call delete service on clear', () => {
      // GIVEN
      jest.spyOn(service, 'delete');

      // WHEN
      comp.cancel();

      // THEN
      expect(service.delete).not.toHaveBeenCalled();
      expect(mockActiveModal.close).not.toHaveBeenCalled();
      expect(mockActiveModal.dismiss).toHaveBeenCalled();
    });
  });
});
