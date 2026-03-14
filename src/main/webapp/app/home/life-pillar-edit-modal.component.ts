import { Component, OnInit, OnChanges, SimpleChanges, inject, Input } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { ILifePillar } from 'app/entities/life-pillar/life-pillar.model';
import { LifePillarService } from 'app/entities/life-pillar/service/life-pillar.service';
import { LifePillarFormService, LifePillarFormGroup } from 'app/entities/life-pillar/update/life-pillar-form.service';
import { LifePillarTranslationService } from 'app/entities/life-pillar-translation/service/life-pillar-translation.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

@Component({
  selector: 'jhi-life-pillar-edit-modal',
  templateUrl: './life-pillar-edit-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LifePillarEditModalComponent implements OnInit, OnChanges {
  private _lifePillar!: ILifePillar;

  @Input()
  set lifePillar(value: ILifePillar) {
    this._lifePillar = value;
    if (value) {
      this.updateForm(value);
      this.loadTranslations();
    }
  }

  get lifePillar(): ILifePillar {
    return this._lifePillar;
  }

  isSaving = false;
  translations = [
    { lang: 'EN' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
    { lang: 'AR' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
    { lang: 'FR' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
  ];

  protected activeModal = inject(NgbActiveModal);
  protected lifePillarService = inject(LifePillarService);
  protected lifePillarFormService = inject(LifePillarFormService);
  protected translationService = inject(LifePillarTranslationService);

  editForm: LifePillarFormGroup = this.lifePillarFormService.createLifePillarFormGroup();

  ngOnInit(): void {
    // Setter handles initialization
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lifePillar'] && this.lifePillar) {
      this.updateForm(this.lifePillar);
      this.loadTranslations();
    }
  }

  getLangLabel(lang: string): string {
    const labels: Record<string, string> = { EN: 'English', AR: 'Arabic', FR: 'French' };
    return labels[lang] ?? lang;
  }

  loadTranslations(): void {
    if (!this.lifePillar) {
      console.warn('LifePillar is not set');
      return;
    }

    const existing = this.lifePillar.translations ?? [];

    this.translations = this.translations.map(t => {
      const found = existing.find(et => et.lang === t.lang);
      return {
        ...t,
        id: found?.id ?? null,
        name: found?.name ?? '',
        description: found?.description ?? '',
      };
    });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  save(): void {
    this.isSaving = true;
    const lifePillar = this.lifePillarFormService.getLifePillar(this.editForm);
    if (lifePillar.id !== null) {
      this.lifePillarService.update(lifePillar).subscribe({
        next: (res: HttpResponse<ILifePillar>) => {
          const updatedPillar = res.body;
          if (updatedPillar) {
            const tasks = this.translations
              .filter(t => t.name || t.description)
              .map(t => {
                const payload: any = {
                  id: t.id ?? null,
                  lang: t.lang,
                  name: t.name,
                  description: t.description,
                  lifePillar: updatedPillar,
                };
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

  protected updateForm(lifePillar: ILifePillar): void {
    this._lifePillar = lifePillar;
    this.lifePillarFormService.resetForm(this.editForm, lifePillar);
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.activeModal.close('saved');
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }
}
