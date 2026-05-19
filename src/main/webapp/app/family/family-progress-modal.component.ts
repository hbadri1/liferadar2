import { Component, Input, OnInit, inject, signal } from '@angular/core';
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
export class FamilyProgressModalComponent implements OnInit {
  @Input() itemDefinition!: FamilyObjectiveItemDefinition;

  isSaving = signal(false);

  protected readonly activeModal = inject(NgbActiveModal);
  private readonly http = inject(HttpClient);
  private readonly formBuilder = inject(FormBuilder);

  readonly editForm = this.formBuilder.group({
    value: [null as number | null, [Validators.required]],
    notes: ['', [Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    if (this.isCheckboxUnit() && this.editForm.get('value')?.value === null) {
      this.editForm.patchValue({ value: 0 });
    }
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  save(): void {
    this.editForm.markAllAsTouched();
    if (!this.itemDefinition?.id) {
      return;
    }

    const formValue = this.editForm.getRawValue();
    const valueToPersist = this.isCheckboxUnit() ? (this.isDoneChecked() ? 1 : 0) : formValue.value;

    if (!this.isCheckboxUnit() && (valueToPersist === null || valueToPersist < 0)) {
      this.editForm.get('value')?.setErrors({ min: true });
      return;
    }

    if (this.editForm.invalid) {
      return;
    }

    this.isSaving.set(true);
    this.http
      .post(`/api/family/objective-items/${this.itemDefinition.id}/progress`, {
        value: valueToPersist,
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

  isCheckboxUnit(): boolean {
    return this.itemDefinition?.unit === ObjectiveUnit.CHECKBOX;
  }

  isDoneChecked(): boolean {
    return (this.editForm.get('value')?.value ?? 0) > 0;
  }

  onDoneToggle(checked: boolean): void {
    this.editForm.patchValue({ value: checked ? 1 : 0 });
  }

  getUnitLabel(unit: ObjectiveUnit): string {
    switch (unit) {
      case ObjectiveUnit.REPS:
        return 'Reps';
      case ObjectiveUnit.SECONDS:
        return 'Seconds';
      case ObjectiveUnit.CHECKBOX:
        return 'Done / Not done';
      default:
        return 'Number';
    }
  }
}

