import { Component, OnInit, inject, Input } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import dayjs from 'dayjs/esm';
import { TranslateService } from '@ngx-translate/core';

import SharedModule from 'app/shared/shared.module';
import { ILifeEvaluation } from 'app/entities/life-evaluation/life-evaluation.model';
import { LifeEvaluationService } from 'app/entities/life-evaluation/service/life-evaluation.service';
import { LifeEvaluationFormService, LifeEvaluationFormGroup } from 'app/entities/life-evaluation/update/life-evaluation-form.service';
import { ISubPillarItem } from 'app/entities/sub-pillar-item/sub-pillar-item.model';
import { ISubPillarItemTranslation } from 'app/entities/sub-pillar-item-translation/sub-pillar-item-translation.model';

@Component({
  selector: 'jhi-life-evaluation-create-modal',
  templateUrl: './life-evaluation-create-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LifeEvaluationCreateModalComponent implements OnInit {
  @Input() subPillarItem?: ISubPillarItem;

  isSaving = false;
  readonly scoreOptions = [1, 2, 3, 4, 5];

  protected activeModal = inject(NgbActiveModal);
  protected lifeEvaluationService = inject(LifeEvaluationService);
  protected lifeEvaluationFormService = inject(LifeEvaluationFormService);
  protected translateService = inject(TranslateService);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: LifeEvaluationFormGroup = this.lifeEvaluationFormService.createLifeEvaluationFormGroup();

  ngOnInit(): void {
    if (this.subPillarItem) {
      // Set default values
      this.editForm.patchValue({
        evaluationDate: dayjs(),
        subPillarItem: this.subPillarItem,
        reminderEnabled: false,
      });
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  getItemName(): string {
    return this.getResolvedItemTranslation()?.name ?? this.subPillarItem?.code ?? 'N/A';
  }

  getItemDescription(): string | null {
    return this.getResolvedItemTranslation()?.description ?? null;
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

  selectScore(score: number): void {
    this.editForm.controls.score.setValue(score);
    this.editForm.controls.score.markAsTouched();
  }

  isScoreSelected(score: number): boolean {
    return this.editForm.controls.score.value === score;
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.activeModal.close('saved');
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  private getResolvedItemTranslation(): ISubPillarItemTranslation | null {
    if (!this.subPillarItem?.translations || this.subPillarItem.translations.length === 0) {
      return null;
    }

    const currentLang = this.translateService.currentLang;
    let translation = this.subPillarItem.translations.find(t => t.lang?.toLowerCase() === currentLang.toLowerCase()) ?? null;
    translation ??= this.subPillarItem.translations.find(t => t.lang?.toLowerCase() === 'en') ?? null;
    translation ??= this.subPillarItem.translations[0] ?? null;

    return translation;
  }
}
