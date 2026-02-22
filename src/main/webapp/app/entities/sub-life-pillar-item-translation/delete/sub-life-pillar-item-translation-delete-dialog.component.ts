import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ISubLifePillarItemTranslation } from '../sub-life-pillar-item-translation.model';
import { SubLifePillarItemTranslationService } from '../service/sub-life-pillar-item-translation.service';

@Component({
  templateUrl: './sub-life-pillar-item-translation-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class SubLifePillarItemTranslationDeleteDialogComponent {
  subLifePillarItemTranslation?: ISubLifePillarItemTranslation;

  protected subLifePillarItemTranslationService = inject(SubLifePillarItemTranslationService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.subLifePillarItemTranslationService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
