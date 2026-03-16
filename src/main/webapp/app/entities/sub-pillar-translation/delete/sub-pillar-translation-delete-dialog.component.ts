import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ISubPillarTranslation } from '../sub-pillar-translation.model';
import { SubPillarTranslationService } from '../service/sub-pillar-translation.service';

@Component({
  templateUrl: './sub-pillar-translation-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class SubPillarTranslationDeleteDialogComponent {
  subPillarTranslation?: ISubPillarTranslation;

  protected subPillarTranslationService = inject(SubPillarTranslationService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.subPillarTranslationService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
