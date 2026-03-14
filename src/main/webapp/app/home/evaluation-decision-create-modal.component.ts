import { Component, OnInit, inject, Input } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { IEvaluationDecision } from 'app/entities/evaluation-decision/evaluation-decision.model';
import { EvaluationDecisionService } from 'app/entities/evaluation-decision/service/evaluation-decision.service';
import {
  EvaluationDecisionFormService,
  EvaluationDecisionFormGroup,
} from 'app/entities/evaluation-decision/update/evaluation-decision-form.service';
import { ILifeEvaluation } from 'app/entities/life-evaluation/life-evaluation.model';

@Component({
  selector: 'jhi-evaluation-decision-create-modal',
  templateUrl: './evaluation-decision-create-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class EvaluationDecisionCreateModalComponent implements OnInit {
  @Input() lifeEvaluation?: ILifeEvaluation;

  isSaving = false;

  protected activeModal = inject(NgbActiveModal);
  protected evaluationDecisionService = inject(EvaluationDecisionService);
  protected evaluationDecisionFormService = inject(EvaluationDecisionFormService);

  editForm: EvaluationDecisionFormGroup = this.evaluationDecisionFormService.createEvaluationDecisionFormGroup();

  ngOnInit(): void {
    if (this.lifeEvaluation) {
      this.editForm.patchValue({
        lifeEvaluation: this.lifeEvaluation,
      });
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  save(): void {
    this.isSaving = true;
    const evaluationDecision = this.evaluationDecisionFormService.getEvaluationDecision(this.editForm);
    if (evaluationDecision.id !== null) {
      return;
    }

    // Date is backend-managed; do not send a client-side value.
    (evaluationDecision as any).date = undefined;

    this.evaluationDecisionService.create(evaluationDecision).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.activeModal.close('saved');
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }
}
