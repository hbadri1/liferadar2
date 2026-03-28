import { Component, Input, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { FamilyObjectiveItemDefinition, ObjectiveUnit } from './family.models';

@Component({
  selector: 'jhi-family-progress-modal',
  templateUrl: './family-progress-modal.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
})
export class FamilyProgressModalComponent {
  @Input() itemDefinition!: FamilyObjectiveItemDefinition;

  isSaving = signal(false);

  protected readonly activeModal = inject(NgbActiveModal);
  private readonly http = inject(HttpClient);
  private readonly formBuilder = inject(FormBuilder);

  readonly editForm = this.formBuilder.group({
    value: [null as number | null, [Validators.required, Validators.min(0)]],
    notes: ['', [Validators.maxLength(1000)]],
  });

  cancel(): void {
    this.activeModal.dismiss();
  }

  save(): void {
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid || !this.itemDefinition?.id) {
      return;
    }

    const formValue = this.editForm.getRawValue();
    this.isSaving.set(true);
    this.http
      .post(`/api/family/objective-items/${this.itemDefinition.id}/progress`, {
        value: formValue.value,
        notes: formValue.notes?.trim() ? formValue.notes : null,
      })
      .subscribe({
        next: response => {
          this.isSaving.set(false);
          this.activeModal.close(response);
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
  }

  getUnitLabel(unit: ObjectiveUnit): string {
    switch (unit) {
      case ObjectiveUnit.REPS:
        return 'Reps';
      case ObjectiveUnit.SECONDS:
        return 'Seconds';
      default:
        return 'Number';
    }
  }
}

