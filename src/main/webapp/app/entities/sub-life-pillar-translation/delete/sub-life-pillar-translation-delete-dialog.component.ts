import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ISubLifePillarTranslation } from '../sub-life-pillar-translation.model';
import { SubLifePillarTranslationService } from '../service/sub-life-pillar-translation.service';

@Component({
  templateUrl: './sub-life-pillar-translation-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class SubLifePillarTranslationDeleteDialogComponent {
  subLifePillarTranslation?: ISubLifePillarTranslation;

  protected subLifePillarTranslationService = inject(SubLifePillarTranslationService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.subLifePillarTranslationService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
