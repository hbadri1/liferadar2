import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IEvaluationDecision } from '../evaluation-decision.model';
import { EvaluationDecisionService } from '../service/evaluation-decision.service';

@Component({
  templateUrl: './evaluation-decision-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class EvaluationDecisionDeleteDialogComponent {
  evaluationDecision?: IEvaluationDecision;

  protected evaluationDecisionService = inject(EvaluationDecisionService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.evaluationDecisionService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
