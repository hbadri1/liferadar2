import { Component, OnInit, inject, Input } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { ISubPillarItem } from 'app/entities/sub-pillar-item/sub-pillar-item.model';
import { SubPillarItemService } from 'app/entities/sub-pillar-item/service/sub-pillar-item.service';
import {
  SubPillarItemFormService,
  SubPillarItemFormGroup,
} from 'app/entities/sub-pillar-item/update/sub-pillar-item-form.service';
import { ISubPillar } from 'app/entities/sub-pillar/sub-pillar.model';
import { SubPillarService } from 'app/entities/sub-pillar/service/sub-pillar.service';
import { SubPillarItemTranslationService } from 'app/entities/sub-pillar-item-translation/service/sub-pillar-item-translation.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

@Component({
  selector: 'jhi-sub-pillar-item-create-modal',
  templateUrl: './sub-pillar-item-create-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubPillarItemCreateModalComponent implements OnInit {
  @Input() subPillarId?: number;

  isSaving = false;
  selectedSubPillar?: ISubPillar;
  translations = [
    { lang: 'EN' as keyof typeof LangCode, name: '', description: '' },
    { lang: 'AR' as keyof typeof LangCode, name: '', description: '' },
    { lang: 'FR' as keyof typeof LangCode, name: '', description: '' },
  ];

  protected activeModal = inject(NgbActiveModal);
  protected subPillarItemService = inject(SubPillarItemService);
  protected subPillarItemFormService = inject(SubPillarItemFormService);
  protected subPillarService = inject(SubPillarService);
  protected translationService = inject(SubPillarItemTranslationService);

  editForm: SubPillarItemFormGroup = this.subPillarItemFormService.createSubPillarItemFormGroup();

  ngOnInit(): void {
    this.editForm.patchValue({ sortOrder: 1, isActive: true });
    this.loadParentSubPillar();
  }

  getLangLabel(lang: string): string {
    const labels: Record<string, string> = { EN: 'English', AR: 'Arabic', FR: 'French' };
    return labels[lang] ?? lang;
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  save(): void {
    this.isSaving = true;
    const subPillarItem = this.subPillarItemFormService.getSubPillarItem(this.editForm);
    if (subPillarItem.id !== null) {
      return;
    }

    // Enforce parent from context and ignore any client-side override.
    subPillarItem.subPillar = this.selectedSubPillar ?? null;

    this.subPillarItemService.create(subPillarItem).subscribe({
      next: (res: HttpResponse<ISubPillarItem>) => {
        const created = res.body;
        if (created) {
          const tasks = this.translations
            .filter(t => t.name || t.description)
            .map(t => {
              const payload: any = { id: null, lang: t.lang, name: t.name, description: t.description, subPillarItem: created };
              return this.translationService.create(payload);
            });

          if (tasks.length > 0) {
            forkJoin(tasks).subscribe({
              next: () => this.onSaveSuccess(),
              error: () => this.onSaveSuccess(),
            });
          } else {
            this.onSaveSuccess();
          }
        } else {
          this.onSaveSuccess();
        }
      },
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

  protected loadParentSubPillar(): void {
    if (!this.subPillarId) {
      this.selectedSubPillar = undefined;
      this.editForm.patchValue({ subPillar: null });
      return;
    }

    this.subPillarService.find(this.subPillarId).subscribe({
      next: (res: HttpResponse<ISubPillar>) => {
        this.selectedSubPillar = res.body ?? undefined;
        this.editForm.patchValue({ subPillar: this.selectedSubPillar ?? null });
      },
      error: () => {
        this.selectedSubPillar = undefined;
        this.editForm.patchValue({ subPillar: null });
      },
    });
  }
}
