import { Component, OnInit, inject, Input } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { ISubPillar } from 'app/entities/sub-pillar/sub-pillar.model';
import { SubPillarService } from 'app/entities/sub-pillar/service/sub-pillar.service';
import { SubPillarFormService, SubPillarFormGroup } from 'app/entities/sub-pillar/update/sub-pillar-form.service';
import { IPillar } from 'app/entities/pillar/pillar.model';
import { PillarService } from 'app/entities/pillar/service/pillar.service';
import { SubPillarTranslationService } from 'app/entities/sub-pillar-translation/service/sub-pillar-translation.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

@Component({
  selector: 'jhi-sub-pillar-create-modal',
  templateUrl: './sub-pillar-create-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubPillarCreateModalComponent implements OnInit {
  @Input() pillarId?: number;

  isSaving = false;
  selectedPillar?: IPillar;
  translations = [
    { lang: 'EN' as keyof typeof LangCode, name: '', description: '' },
    { lang: 'AR' as keyof typeof LangCode, name: '', description: '' },
    { lang: 'FR' as keyof typeof LangCode, name: '', description: '' },
  ];

  protected activeModal = inject(NgbActiveModal);
  protected subPillarService = inject(SubPillarService);
  protected subPillarFormService = inject(SubPillarFormService);
  protected pillarService = inject(PillarService);
  protected translationService = inject(SubPillarTranslationService);

  editForm: SubPillarFormGroup = this.subPillarFormService.createSubPillarFormGroup();

  ngOnInit(): void {
    this.editForm.patchValue({ isActive: true });
    this.loadParentPillar();
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
    const subPillar = this.subPillarFormService.getSubPillar(this.editForm);
    if (subPillar.id !== null) {
      return;
    }

    // Enforce parent from context and ignore any client-side override.
    subPillar.pillar = this.selectedPillar ?? null;

    this.subPillarService.create(subPillar).subscribe({
      next: (res: HttpResponse<ISubPillar>) => {
        const created = res.body;
        if (created) {
          const tasks = this.translations
            .filter(t => t.name || t.description)
            .map(t => {
              const payload: any = { id: null, lang: t.lang, name: t.name, description: t.description, subPillar: created };
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

  protected loadParentPillar(): void {
    if (!this.pillarId) {
      this.selectedPillar = undefined;
      this.editForm.patchValue({ pillar: null });
      return;
    }

    this.pillarService.find(this.pillarId).subscribe({
      next: (res: HttpResponse<IPillar>) => {
        this.selectedPillar = res.body ?? undefined;
        this.editForm.patchValue({ pillar: this.selectedPillar ?? null });
      },
      error: () => {
        this.selectedPillar = undefined;
        this.editForm.patchValue({ pillar: null });
      },
    });
  }
}
