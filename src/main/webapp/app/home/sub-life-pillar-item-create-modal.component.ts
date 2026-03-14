import { Component, OnInit, inject, Input } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { ISubLifePillarItem } from 'app/entities/sub-life-pillar-item/sub-life-pillar-item.model';
import { SubLifePillarItemService } from 'app/entities/sub-life-pillar-item/service/sub-life-pillar-item.service';
import {
  SubLifePillarItemFormService,
  SubLifePillarItemFormGroup,
} from 'app/entities/sub-life-pillar-item/update/sub-life-pillar-item-form.service';
import { ISubLifePillar } from 'app/entities/sub-life-pillar/sub-life-pillar.model';
import { SubLifePillarService } from 'app/entities/sub-life-pillar/service/sub-life-pillar.service';
import { SubLifePillarItemTranslationService } from 'app/entities/sub-life-pillar-item-translation/service/sub-life-pillar-item-translation.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

@Component({
  selector: 'jhi-sub-life-pillar-item-create-modal',
  templateUrl: './sub-life-pillar-item-create-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubLifePillarItemCreateModalComponent implements OnInit {
  @Input() subLifePillarId?: number;

  isSaving = false;
  selectedSubLifePillar?: ISubLifePillar;
  translations = [
    { lang: 'EN' as keyof typeof LangCode, name: '', description: '' },
    { lang: 'AR' as keyof typeof LangCode, name: '', description: '' },
    { lang: 'FR' as keyof typeof LangCode, name: '', description: '' },
  ];

  protected activeModal = inject(NgbActiveModal);
  protected subLifePillarItemService = inject(SubLifePillarItemService);
  protected subLifePillarItemFormService = inject(SubLifePillarItemFormService);
  protected subLifePillarService = inject(SubLifePillarService);
  protected translationService = inject(SubLifePillarItemTranslationService);

  editForm: SubLifePillarItemFormGroup = this.subLifePillarItemFormService.createSubLifePillarItemFormGroup();

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
    const subLifePillarItem = this.subLifePillarItemFormService.getSubLifePillarItem(this.editForm);
    if (subLifePillarItem.id !== null) {
      return;
    }

    // Enforce parent from context and ignore any client-side override.
    subLifePillarItem.subLifePillar = this.selectedSubLifePillar ?? null;

    this.subLifePillarItemService.create(subLifePillarItem).subscribe({
      next: (res: HttpResponse<ISubLifePillarItem>) => {
        const created = res.body;
        if (created) {
          const tasks = this.translations
            .filter(t => t.name || t.description)
            .map(t => {
              const payload: any = { id: null, lang: t.lang, name: t.name, description: t.description, subLifePillarItem: created };
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
    if (!this.subLifePillarId) {
      this.selectedSubLifePillar = undefined;
      this.editForm.patchValue({ subLifePillar: null });
      return;
    }

    this.subLifePillarService.find(this.subLifePillarId).subscribe({
      next: (res: HttpResponse<ISubLifePillar>) => {
        this.selectedSubLifePillar = res.body ?? undefined;
        this.editForm.patchValue({ subLifePillar: this.selectedSubLifePillar ?? null });
      },
      error: () => {
        this.selectedSubLifePillar = undefined;
        this.editForm.patchValue({ subLifePillar: null });
      },
    });
  }
}
