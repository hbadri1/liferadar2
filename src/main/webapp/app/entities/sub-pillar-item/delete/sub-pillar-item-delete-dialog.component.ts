import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ISubPillarItem } from '../sub-pillar-item.model';
import { SubPillarItemService } from '../service/sub-pillar-item.service';

@Component({
  templateUrl: './sub-pillar-item-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class SubPillarItemDeleteDialogComponent {
  subPillarItem?: ISubPillarItem;

  protected subPillarItemService = inject(SubPillarItemService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.subPillarItemService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
