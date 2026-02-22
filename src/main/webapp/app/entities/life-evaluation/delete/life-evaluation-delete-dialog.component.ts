import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ILifeEvaluation } from '../life-evaluation.model';
import { LifeEvaluationService } from '../service/life-evaluation.service';

@Component({
  templateUrl: './life-evaluation-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class LifeEvaluationDeleteDialogComponent {
  lifeEvaluation?: ILifeEvaluation;

  protected lifeEvaluationService = inject(LifeEvaluationService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.lifeEvaluationService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
