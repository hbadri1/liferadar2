import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ISubLifePillarItem } from '../sub-life-pillar-item.model';
import { SubLifePillarItemService } from '../service/sub-life-pillar-item.service';

@Component({
  templateUrl: './sub-life-pillar-item-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class SubLifePillarItemDeleteDialogComponent {
  subLifePillarItem?: ISubLifePillarItem;

  protected subLifePillarItemService = inject(SubLifePillarItemService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.subLifePillarItemService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
