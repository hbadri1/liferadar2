import { Component, OnInit, inject, Input } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { ISubLifePillar } from 'app/entities/sub-life-pillar/sub-life-pillar.model';
import { SubLifePillarService } from 'app/entities/sub-life-pillar/service/sub-life-pillar.service';
import { SubLifePillarFormService, SubLifePillarFormGroup } from 'app/entities/sub-life-pillar/update/sub-life-pillar-form.service';
import { ILifePillar } from 'app/entities/life-pillar/life-pillar.model';
import { LifePillarService } from 'app/entities/life-pillar/service/life-pillar.service';
import { SubLifePillarTranslationService } from 'app/entities/sub-life-pillar-translation/service/sub-life-pillar-translation.service';
import { LangCode } from 'app/entities/enumerations/lang-code.model';

@Component({
  selector: 'jhi-sub-life-pillar-create-modal',
  templateUrl: './sub-life-pillar-create-modal.component.html',
  standalone: true,
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class SubLifePillarCreateModalComponent implements OnInit {
  @Input() lifePillarId?: number;

  isSaving = false;
  selectedLifePillar?: ILifePillar;
  translations = [
    { lang: 'EN' as keyof typeof LangCode, name: '', description: '' },
    { lang: 'AR' as keyof typeof LangCode, name: '', description: '' },
    { lang: 'FR' as keyof typeof LangCode, name: '', description: '' },
  ];

  protected activeModal = inject(NgbActiveModal);
  protected subLifePillarService = inject(SubLifePillarService);
  protected subLifePillarFormService = inject(SubLifePillarFormService);
  protected lifePillarService = inject(LifePillarService);
  protected translationService = inject(SubLifePillarTranslationService);

  editForm: SubLifePillarFormGroup = this.subLifePillarFormService.createSubLifePillarFormGroup();

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
    const subLifePillar = this.subLifePillarFormService.getSubLifePillar(this.editForm);
    if (subLifePillar.id !== null) {
      return;
    }

    // Enforce parent from context and ignore any client-side override.
    subLifePillar.lifePillar = this.selectedLifePillar ?? null;

    this.subLifePillarService.create(subLifePillar).subscribe({
      next: (res: HttpResponse<ISubLifePillar>) => {
        const created = res.body;
        if (created) {
          const tasks = this.translations
            .filter(t => t.name || t.description)
            .map(t => {
              const payload: any = { id: null, lang: t.lang, name: t.name, description: t.description, subLifePillar: created };
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
    if (!this.lifePillarId) {
      this.selectedLifePillar = undefined;
      this.editForm.patchValue({ lifePillar: null });
      return;
    }

    this.lifePillarService.find(this.lifePillarId).subscribe({
      next: (res: HttpResponse<ILifePillar>) => {
        this.selectedLifePillar = res.body ?? undefined;
        this.editForm.patchValue({ lifePillar: this.selectedLifePillar ?? null });
      },
      error: () => {
        this.selectedLifePillar = undefined;
        this.editForm.patchValue({ lifePillar: null });
      },
    });
  }
}
