import { Component, OnInit, OnChanges, SimpleChanges, inject, Input } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { IPillar } from 'app/entities/pillar/pillar.model';
import { PillarService } from 'app/entities/pillar/service/pillar.service';
import { PillarFormService, PillarFormGroup } from 'app/entities/pillar/update/pillar-form.service';
import { PillarTranslationService } from 'app/entities/pillar-translation/service/pillar-translation.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

@Component({
  selector: 'jhi-pillar-edit-modal',
  templateUrl: './pillar-edit-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PillarEditModalComponent implements OnInit, OnChanges {
  private _pillar!: IPillar;

  @Input()
  set pillar(value: IPillar) {
    this._pillar = value;
    if (value) {
      this.updateForm(value);
      this.loadTranslations();
    }
  }

  get pillar(): IPillar {
    return this._pillar;
  }

  isSaving = false;
  translations = [
    { lang: 'EN' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
    { lang: 'AR' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
    { lang: 'FR' as keyof typeof LangCode, name: '', description: '', id: null as number | null },
  ];

  protected activeModal = inject(NgbActiveModal);
  protected pillarService = inject(PillarService);
  protected pillarFormService = inject(PillarFormService);
  protected translationService = inject(PillarTranslationService);

  editForm: PillarFormGroup = this.pillarFormService.createPillarFormGroup();

  ngOnInit(): void {
    // Setter handles initialization
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pillar'] && this.pillar) {
      this.updateForm(this.pillar);
      this.loadTranslations();
    }
  }

  getLangLabel(lang: string): string {
    const labels: Record<string, string> = { EN: 'English', AR: 'Arabic', FR: 'French' };
    return labels[lang] ?? lang;
  }

  loadTranslations(): void {
    if (!this.pillar) {
      console.warn('Pillar is not set');
      return;
    }

    const existing = this.pillar.translations ?? [];

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
    const pillar = this.pillarFormService.getPillar(this.editForm);
    if (pillar.id !== null) {
      this.pillarService.update(pillar).subscribe({
        next: (res: HttpResponse<IPillar>) => {
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
                  pillar: updatedPillar,
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

  protected updateForm(pillar: IPillar): void {
    this._pillar = pillar;
    this.pillarFormService.resetForm(this.editForm, pillar);
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.activeModal.close('saved');
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }
}
