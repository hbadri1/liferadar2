import { Component, OnInit, inject } from '@angular/core';
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
  selector: 'jhi-pillar-create-modal',
  templateUrl: './pillar-create-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class PillarCreateModalComponent implements OnInit {
  isSaving = false;
  translations = [
    { lang: 'EN' as keyof typeof LangCode, name: '', description: '' },
    { lang: 'AR' as keyof typeof LangCode, name: '', description: '' },
    { lang: 'FR' as keyof typeof LangCode, name: '', description: '' },
  ];

  protected activeModal = inject(NgbActiveModal);
  protected pillarService = inject(PillarService);
  protected pillarFormService = inject(PillarFormService);
  protected translationService = inject(PillarTranslationService);

  editForm: PillarFormGroup = this.pillarFormService.createPillarFormGroup();

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
    const pillar = this.pillarFormService.getPillar(this.editForm);
    if (pillar.id !== null) {
      // This shouldn't happen in create modal, but handle it for safety
      return;
    }

    this.pillarService.create(pillar).subscribe({
      next: (res: HttpResponse<IPillar>) => {
        const createdPillar = res.body;
        if (createdPillar) {
          const translationTasks = this.translations
            .filter(t => t.name || t.description)
            .map(t => {
              const payload: any = { id: null, lang: t.lang, name: t.name, description: t.description, pillar: createdPillar };
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
