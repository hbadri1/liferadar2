import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ILifePillarTranslation } from '../life-pillar-translation.model';
import { LifePillarTranslationService } from '../service/life-pillar-translation.service';

@Component({
  templateUrl: './life-pillar-translation-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class LifePillarTranslationDeleteDialogComponent {
  lifePillarTranslation?: ILifePillarTranslation;

  protected lifePillarTranslationService = inject(LifePillarTranslationService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.lifePillarTranslationService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
