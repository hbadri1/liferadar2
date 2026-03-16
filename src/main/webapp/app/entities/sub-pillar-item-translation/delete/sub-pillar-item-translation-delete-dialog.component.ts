import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ISubPillarItemTranslation } from '../sub-pillar-item-translation.model';
import { SubPillarItemTranslationService } from '../service/sub-pillar-item-translation.service';

@Component({
  templateUrl: './sub-pillar-item-translation-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class SubPillarItemTranslationDeleteDialogComponent {
  subPillarItemTranslation?: ISubPillarItemTranslation;

  protected subPillarItemTranslationService = inject(SubPillarItemTranslationService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.subPillarItemTranslationService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
