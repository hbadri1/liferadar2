import { Component, OnInit, inject, Input } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import SharedModule from 'app/shared/shared.module';
import { ILifeEvaluation } from 'app/entities/life-evaluation/life-evaluation.model';
import { LifeEvaluationService } from 'app/entities/life-evaluation/service/life-evaluation.service';
import { LifeEvaluationFormService, LifeEvaluationFormGroup } from 'app/entities/life-evaluation/update/life-evaluation-form.service';
import { ISubLifePillarItem } from 'app/entities/sub-life-pillar-item/sub-life-pillar-item.model';

@Component({
  selector: 'jhi-life-evaluation-create-modal',
  templateUrl: './life-evaluation-create-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LifeEvaluationCreateModalComponent implements OnInit {
  @Input() subLifePillarItem?: ISubLifePillarItem;

  isSaving = false;

  protected activeModal = inject(NgbActiveModal);
  protected lifeEvaluationService = inject(LifeEvaluationService);
  protected lifeEvaluationFormService = inject(LifeEvaluationFormService);

  editForm: LifeEvaluationFormGroup = this.lifeEvaluationFormService.createLifeEvaluationFormGroup();

  ngOnInit(): void {
    if (this.subLifePillarItem) {
      // Set default values
      this.editForm.patchValue({
        evaluationDate: dayjs(),
        subLifePillarItem: this.subLifePillarItem,
        reminderEnabled: false,
      });
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  save(): void {
    this.isSaving = true;
    const lifeEvaluation = this.lifeEvaluationFormService.getLifeEvaluation(this.editForm);
    if (lifeEvaluation.id !== null) {
      // This shouldn't happen in create modal, but handle it for safety
      return;
    }

    this.lifeEvaluationService.create(lifeEvaluation).subscribe({
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

