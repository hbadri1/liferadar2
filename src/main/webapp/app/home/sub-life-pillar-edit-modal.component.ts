import { Component, OnInit, OnChanges, SimpleChanges, inject, Input } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { ISubLifePillar } from 'app/entities/sub-life-pillar/sub-life-pillar.model';
import { SubLifePillarService } from 'app/entities/sub-life-pillar/service/sub-life-pillar.service';
import { SubLifePillarFormService, SubLifePillarFormGroup } from 'app/entities/sub-life-pillar/update/sub-life-pillar-form.service';
import { ILifePillar } from 'app/entities/life-pillar/life-pillar.model';
import { SubLifePillarTranslationService } from 'app/entities/sub-life-pillar-translation/service/sub-life-pillar-translation.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

@Component({
  selector: 'jhi-sub-life-pillar-edit-modal',
  templateUrl: './sub-life-pillar-edit-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubLifePillarEditModalComponent implements OnInit, OnChanges {
  private _subLifePillar!: ISubLifePillar;
  selectedLifePillar?: ILifePillar;

  @Input()
  set subLifePillar(value: ISubLifePillar) {
    this._subLifePillar = value;
    if (value) {
      this.updateForm(value);
      this.loadTranslations();
    }
  }

  get subLifePillar(): ISubLifePillar {
    return this._subLifePillar;
  }

  isSaving = false;
  translations = [
    { lang: 'EN' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
    { lang: 'AR' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
    { lang: 'FR' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
  ];

  protected activeModal = inject(NgbActiveModal);
  protected subLifePillarService = inject(SubLifePillarService);
  protected subLifePillarFormService = inject(SubLifePillarFormService);
  protected translationService = inject(SubLifePillarTranslationService);

  editForm: SubLifePillarFormGroup = this.subLifePillarFormService.createSubLifePillarFormGroup();

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subLifePillar'] && this.subLifePillar) {
      this.updateForm(this.subLifePillar);
      this.loadTranslations();
    }
  }

  getLangLabel(lang: string): string {
    const labels: Record<string, string> = { EN: 'English', AR: 'Arabic', FR: 'French' };
    return labels[lang] ?? lang;
  }

  loadTranslations(): void {
    if (!this.subLifePillar) {
      console.warn('SubLifePillar is not set');
      return;
    }

    console.log('Loading translations for sub-pillar:', this.subLifePillar);
    const existing = this.subLifePillar.translations ?? [];
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
    const subLifePillar = this.subLifePillarFormService.getSubLifePillar(this.editForm);
    if (subLifePillar.id !== null) {
      // Enforce parent from persisted entity context.
      subLifePillar.lifePillar = this.subLifePillar.lifePillar ?? null;

      this.subLifePillarService.update(subLifePillar).subscribe({
        next: (res: HttpResponse<ISubLifePillar>) => {
          const updated = res.body;
          if (updated) {
            const tasks = this.translations
              .filter(t => t.name || t.description)
              .map(t => {
                const payload: any = { id: t.id ?? null, lang: t.lang, name: t.name, description: t.description, subLifePillar: updated };
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

  protected updateForm(subLifePillar: ISubLifePillar): void {
    this._subLifePillar = subLifePillar;
    this.selectedLifePillar = subLifePillar.lifePillar ?? undefined;
    this.subLifePillarFormService.resetForm(this.editForm, subLifePillar);
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.activeModal.close('saved');
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }
}

