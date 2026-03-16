import { Component, OnInit, OnChanges, SimpleChanges, inject, Input } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { ISubPillar } from 'app/entities/sub-pillar/sub-pillar.model';
import { SubPillarService } from 'app/entities/sub-pillar/service/sub-pillar.service';
import { SubPillarFormService, SubPillarFormGroup } from 'app/entities/sub-pillar/update/sub-pillar-form.service';
import { IPillar } from 'app/entities/pillar/pillar.model';
import { SubPillarTranslationService } from 'app/entities/sub-pillar-translation/service/sub-pillar-translation.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

@Component({
  selector: 'jhi-sub-pillar-edit-modal',
  templateUrl: './sub-pillar-edit-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubPillarEditModalComponent implements OnInit, OnChanges {
  private _subPillar!: ISubPillar;
  selectedPillar?: IPillar;

  @Input()
  set subPillar(value: ISubPillar) {
    this._subPillar = value;
    if (value) {
      this.updateForm(value);
      this.loadTranslations();
    }
  }

  get subPillar(): ISubPillar {
    return this._subPillar;
  }

  isSaving = false;
  translations = [
    { lang: 'EN' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
    { lang: 'AR' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
    { lang: 'FR' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
  ];

  protected activeModal = inject(NgbActiveModal);
  protected subPillarService = inject(SubPillarService);
  protected subPillarFormService = inject(SubPillarFormService);
  protected translationService = inject(SubPillarTranslationService);

  editForm: SubPillarFormGroup = this.subPillarFormService.createSubPillarFormGroup();

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subPillar'] && this.subPillar) {
      this.updateForm(this.subPillar);
      this.loadTranslations();
    }
  }

  getLangLabel(lang: string): string {
    const labels: Record<string, string> = { EN: 'English', AR: 'Arabic', FR: 'French' };
    return labels[lang] ?? lang;
  }

  loadTranslations(): void {
    if (!this.subPillar) {
      console.warn('SubPillar is not set');
      return;
    }

    console.log('Loading translations for sub-pillar:', this.subPillar);
    const existing = this.subPillar.translations ?? [];
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
    const subPillar = this.subPillarFormService.getSubPillar(this.editForm);
    if (subPillar.id !== null) {
      // Enforce parent from persisted entity context.
      subPillar.pillar = this.subPillar.pillar ?? null;

      this.subPillarService.update(subPillar).subscribe({
        next: (res: HttpResponse<ISubPillar>) => {
          const updated = res.body;
          if (updated) {
            const tasks = this.translations
              .filter(t => t.name || t.description)
              .map(t => {
                const payload: any = { id: t.id ?? null, lang: t.lang, name: t.name, description: t.description, subPillar: updated };
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

  protected updateForm(subPillar: ISubPillar): void {
    this._subPillar = subPillar;
    this.selectedPillar = subPillar.pillar ?? undefined;
    this.subPillarFormService.resetForm(this.editForm, subPillar);
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.activeModal.close('saved');
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }
}

