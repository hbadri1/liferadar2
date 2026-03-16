import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IPillarTranslation } from '../pillar-translation.model';
import { PillarTranslationService } from '../service/pillar-translation.service';

@Component({
  templateUrl: './pillar-translation-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class PillarTranslationDeleteDialogComponent {
  pillarTranslation?: IPillarTranslation;

  protected pillarTranslationService = inject(PillarTranslationService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.pillarTranslationService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
