jest.mock('@ng-bootstrap/ng-bootstrap');

import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SubLifePillarItemTranslationService } from '../service/sub-life-pillar-item-translation.service';

import { SubLifePillarItemTranslationDeleteDialogComponent } from './sub-life-pillar-item-translation-delete-dialog.component';

describe('SubLifePillarItemTranslation Management Delete Component', () => {
  let comp: SubLifePillarItemTranslationDeleteDialogComponent;
  let fixture: ComponentFixture<SubLifePillarItemTranslationDeleteDialogComponent>;
  let service: SubLifePillarItemTranslationService;
  let mockActiveModal: NgbActiveModal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubLifePillarItemTranslationDeleteDialogComponent],
      providers: [provideHttpClient(), NgbActiveModal],
    })
      .overrideTemplate(SubLifePillarItemTranslationDeleteDialogComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(SubLifePillarItemTranslationDeleteDialogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(SubLifePillarItemTranslationService);
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
