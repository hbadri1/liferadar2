import { Component, inject } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import SharedModule from 'app/shared/shared.module';
import { ContactModalComponent } from 'app/home/contact-modal.component';

@Component({
  selector: 'jhi-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  imports: [SharedModule],
})
export default class FooterComponent {
  readonly currentYear = new Date().getFullYear();

  private readonly modalService = inject(NgbModal);

  openFeedback(): void {
    this.modalService.open(ContactModalComponent, {
      size: 'md',
      centered: true,
      backdrop: 'static',
    });
  }
}
