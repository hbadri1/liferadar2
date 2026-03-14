import { Component, Input, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'jhi-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
  standalone: true,
  imports: [SharedModule],
})
export class ConfirmationModalComponent {
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmButtonText = 'Confirm';
  @Input() confirmButtonClass = 'btn-danger';
  @Input() cancelButtonText = 'Cancel';

  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss('cancel');
  }

  confirm(): void {
    this.activeModal.close('confirmed');
  }
}

