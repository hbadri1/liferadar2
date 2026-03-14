import { Component, OnInit, OnChanges, SimpleChanges, inject, Input } from '@angular/core';
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
import { SubLifePillarItemTranslationService } from 'app/entities/sub-life-pillar-item-translation/service/sub-life-pillar-item-translation.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

@Component({
  selector: 'jhi-sub-life-pillar-item-edit-modal',
  templateUrl: './sub-life-pillar-item-edit-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubLifePillarItemEditModalComponent implements OnInit, OnChanges {
  private _subLifePillarItem!: ISubLifePillarItem;
  selectedSubLifePillar?: ISubLifePillar;

  @Input()
  set subLifePillarItem(value: ISubLifePillarItem) {
    this._subLifePillarItem = value;
    if (value) {
      this.updateForm(value);
      this.loadTranslations();
    }
  }

  get subLifePillarItem(): ISubLifePillarItem {
    return this._subLifePillarItem;
  }

  isSaving = false;
  translations = [
    { lang: 'EN' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
    { lang: 'AR' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
    { lang: 'FR' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
  ];

  protected activeModal = inject(NgbActiveModal);
  protected subLifePillarItemService = inject(SubLifePillarItemService);
  protected subLifePillarItemFormService = inject(SubLifePillarItemFormService);
  protected translationService = inject(SubLifePillarItemTranslationService);

  editForm: SubLifePillarItemFormGroup = this.subLifePillarItemFormService.createSubLifePillarItemFormGroup();

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    // The setter handles the input changes, so this might not be necessary
    // but we keep it for completeness
    if (changes['subLifePillarItem'] && this.subLifePillarItem) {
      this.updateForm(this.subLifePillarItem);
      this.loadTranslations();
    }
  }

  getLangLabel(lang: string): string {
    const labels: Record<string, string> = { EN: 'English', AR: 'Arabic', FR: 'French' };
    return labels[lang] ?? lang;
  }

  loadTranslations(): void {
    if (!this.subLifePillarItem) {
      console.warn('SubLifePillarItem is not set');
      return;
    }

    console.log('Loading translations for item:', this.subLifePillarItem);
    const existing = this.subLifePillarItem.translations ?? [];
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
    const subLifePillarItem = this.subLifePillarItemFormService.getSubLifePillarItem(this.editForm);
    if (subLifePillarItem.id !== null) {
      // Enforce parent from persisted entity context.
      subLifePillarItem.subLifePillar = this.subLifePillarItem.subLifePillar ?? null;

      this.subLifePillarItemService.update(subLifePillarItem).subscribe({
        next: (res: HttpResponse<ISubLifePillarItem>) => {
          const updated = res.body;
          if (updated) {
            const tasks = this.translations
              .filter(t => t.name || t.description)
              .map(t => {
                const payload: any = { id: t.id ?? null, lang: t.lang, name: t.name, description: t.description, subLifePillarItem: updated };
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

  protected updateForm(subLifePillarItem: ISubLifePillarItem): void {
    this._subLifePillarItem = subLifePillarItem;
    this.selectedSubLifePillar = subLifePillarItem.subLifePillar ?? undefined;
    this.subLifePillarItemFormService.resetForm(this.editForm, subLifePillarItem);
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.activeModal.close('saved');
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }
}
