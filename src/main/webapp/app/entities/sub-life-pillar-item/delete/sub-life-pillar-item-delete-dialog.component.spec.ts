jest.mock('@ng-bootstrap/ng-bootstrap');

import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SubLifePillarItemService } from '../service/sub-life-pillar-item.service';

import { SubLifePillarItemDeleteDialogComponent } from './sub-life-pillar-item-delete-dialog.component';

describe('SubLifePillarItem Management Delete Component', () => {
  let comp: SubLifePillarItemDeleteDialogComponent;
  let fixture: ComponentFixture<SubLifePillarItemDeleteDialogComponent>;
  let service: SubLifePillarItemService;
  let mockActiveModal: NgbActiveModal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SubLifePillarItemDeleteDialogComponent],
      providers: [provideHttpClient(), NgbActiveModal],
    })
      .overrideTemplate(SubLifePillarItemDeleteDialogComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(SubLifePillarItemDeleteDialogComponent);
    comp = fixture.componentInstance;
    service = TestBed.inject(SubLifePillarItemService);
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
