import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IPillar } from '../pillar.model';
import { PillarService } from '../service/pillar.service';

@Component({
  templateUrl: './pillar-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class PillarDeleteDialogComponent {
  pillar?: IPillar;

  protected pillarService = inject(PillarService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.pillarService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
