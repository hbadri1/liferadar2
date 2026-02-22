import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ILifePillar } from '../life-pillar.model';
import { LifePillarService } from '../service/life-pillar.service';

@Component({
  templateUrl: './life-pillar-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class LifePillarDeleteDialogComponent {
  lifePillar?: ILifePillar;

  protected lifePillarService = inject(LifePillarService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.lifePillarService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
