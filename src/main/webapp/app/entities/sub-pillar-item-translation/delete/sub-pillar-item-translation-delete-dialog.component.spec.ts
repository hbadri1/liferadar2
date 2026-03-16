jest.mock('@ng-bootstrap/ng-bootstrap');

import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SubPillarItemTranslationService } from '../service/sub-pillar-item-translation.service';

import { SubPillarItemTranslationDeleteDialogComponent } from './sub-pillar-item-translation-delete-dialog.component';

describe('SubPillarItemTranslation Management Delete Component', () => {
  let comp: SubPillarItemTranslationDeleteDialogComponent;
  let fixture: ComponentFixture<SubPillarItemTranslationDeleteDialogComponent>;
  let service: SubPillarItemTranslationService;
  let mockActiveModal: NgbActiveModal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubPillarItemTranslationDeleteDialogComponent],
      providers: [provideHttpClient(), NgbActiveModal],
    })
      .overrideTemplate(SubPillarItemTranslationDeleteDialogComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(SubPillarItemTranslationDeleteDialogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(SubPillarItemTranslationService);
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
