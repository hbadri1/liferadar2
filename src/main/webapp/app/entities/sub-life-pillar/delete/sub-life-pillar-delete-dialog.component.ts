import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ISubLifePillar } from '../sub-life-pillar.model';
import { SubLifePillarService } from '../service/sub-life-pillar.service';

@Component({
  templateUrl: './sub-life-pillar-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class SubLifePillarDeleteDialogComponent {
  subLifePillar?: ISubLifePillar;

  protected subLifePillarService = inject(SubLifePillarService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.subLifePillarService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
