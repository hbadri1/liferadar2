import { Component, OnInit, OnChanges, SimpleChanges, inject, Input } from '@angular/core';
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
import { SubPillarItemTranslationService } from 'app/entities/sub-pillar-item-translation/service/sub-pillar-item-translation.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

@Component({
  selector: 'jhi-sub-pillar-item-edit-modal',
  templateUrl: './sub-pillar-item-edit-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubPillarItemEditModalComponent implements OnInit, OnChanges {
  private _subPillarItem!: ISubPillarItem;
  selectedSubPillar?: ISubPillar;

  @Input()
  set subPillarItem(value: ISubPillarItem) {
    this._subPillarItem = value;
    if (value) {
      this.updateForm(value);
      this.loadTranslations();
    }
  }

  get subPillarItem(): ISubPillarItem {
    return this._subPillarItem;
  }

  isSaving = false;
  translations = [
    { lang: 'EN' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
    { lang: 'AR' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
    { lang: 'FR' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
  ];

  protected activeModal = inject(NgbActiveModal);
  protected subPillarItemService = inject(SubPillarItemService);
  protected subPillarItemFormService = inject(SubPillarItemFormService);
  protected translationService = inject(SubPillarItemTranslationService);

  editForm: SubPillarItemFormGroup = this.subPillarItemFormService.createSubPillarItemFormGroup();

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    // The setter handles the input changes, so this might not be necessary
    // but we keep it for completeness
    if (changes['subPillarItem'] && this.subPillarItem) {
      this.updateForm(this.subPillarItem);
      this.loadTranslations();
    }
  }

  getLangLabel(lang: string): string {
    const labels: Record<string, string> = { EN: 'English', AR: 'Arabic', FR: 'French' };
    return labels[lang] ?? lang;
  }

  loadTranslations(): void {
    if (!this.subPillarItem) {
      console.warn('SubPillarItem is not set');
      return;
    }

    console.log('Loading translations for item:', this.subPillarItem);
    const existing = this.subPillarItem.translations ?? [];
    console.log('Existing translations:', existing);

    this.translations = this.translations.map(t => {
      const found = existing.find(et => et.lang === t.lang);
      return {
        ...t,
        id: found?.id ?? null,
        name: found?.name ?? '',
        description: found?.description ?? '',
      };
    });

    console.log('Mapped translations:', this.translations);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  save(): void {
    this.isSaving = true;
    const subPillarItem = this.subPillarItemFormService.getSubPillarItem(this.editForm);
    if (subPillarItem.id !== null) {
      // Enforce parent from persisted entity context.
      subPillarItem.subPillar = this.subPillarItem.subPillar ?? null;

      this.subPillarItemService.update(subPillarItem).subscribe({
        next: (res: HttpResponse<ISubPillarItem>) => {
          const updated = res.body;
          if (updated) {
            const tasks = this.translations
              .filter(t => t.name || t.description)
              .map(t => {
                const payload: any = { id: t.id ?? null, lang: t.lang, name: t.name, description: t.description, subPillarItem: updated };
                return t.id ? this.translationService.update(payload) : this.translationService.create(payload);
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
  }

  protected updateForm(subPillarItem: ISubPillarItem): void {
    this._subPillarItem = subPillarItem;
    this.selectedSubPillar = subPillarItem.subPillar ?? undefined;
    this.subPillarItemFormService.resetForm(this.editForm, subPillarItem);
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.activeModal.close('saved');
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }
}
