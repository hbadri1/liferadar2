import { Component, OnInit, inject } from '@angular/core';
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
  selector: 'jhi-life-pillar-create-modal',
  templateUrl: './life-pillar-create-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class LifePillarCreateModalComponent implements OnInit {
  isSaving = false;
  translations = [
    { lang: 'EN' as keyof typeof LangCode, name: '', description: '' },
    { lang: 'AR' as keyof typeof LangCode, name: '', description: '' },
    { lang: 'FR' as keyof typeof LangCode, name: '', description: '' },
  ];

  protected activeModal = inject(NgbActiveModal);
  protected lifePillarService = inject(LifePillarService);
  protected lifePillarFormService = inject(LifePillarFormService);
  protected translationService = inject(LifePillarTranslationService);

  editForm: LifePillarFormGroup = this.lifePillarFormService.createLifePillarFormGroup();

  ngOnInit(): void {
    // Set default value for isActive
    this.editForm.patchValue({ isActive: true });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  getLangLabel(lang: string): string {
    const labels: Record<string, string> = { EN: 'English', AR: 'Arabic', FR: 'French' };
    return labels[lang] ?? lang;
  }

  save(): void {
    this.isSaving = true;
    const lifePillar = this.lifePillarFormService.getLifePillar(this.editForm);
    if (lifePillar.id !== null) {
      // This shouldn't happen in create modal, but handle it for safety
      return;
    }

    this.lifePillarService.create(lifePillar).subscribe({
      next: (res: HttpResponse<ILifePillar>) => {
        const createdPillar = res.body;
        if (createdPillar) {
          const translationTasks = this.translations
            .filter(t => t.name || t.description)
            .map(t => {
              const payload: any = { id: null, lang: t.lang, name: t.name, description: t.description, lifePillar: createdPillar };
              return this.translationService.create(payload);
            });

          if (translationTasks.length > 0) {
            forkJoin(translationTasks).subscribe({
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
}
