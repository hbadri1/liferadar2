import { Component, Input, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ChildUser, ObjectiveUnit } from './family.models';

@Component({
  selector: 'jhi-family-objective-modal',
  templateUrl: './family-objective-modal.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
})
export class FamilyObjectiveModalComponent {
  @Input() children: ChildUser[] = [];

  isSaving = signal(false);
  selectionError = signal(false);
  itemsError = signal(false);
  readonly units = Object.values(ObjectiveUnit);

  protected readonly activeModal = inject(NgbActiveModal);
  private readonly http = inject(HttpClient);
  private readonly formBuilder = inject(FormBuilder);

  readonly editForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.maxLength(1000)]],
    itemDefinitions: this.formBuilder.array([this.createItemDefinitionFormGroup()]),
  });

  private selectedKidLogins = new Set<string>();

  cancel(): void {
    this.activeModal.dismiss();
  }

  save(): void {
    this.editForm.markAllAsTouched();
    this.selectionError.set(this.selectedKidLogins.size === 0);
    this.itemsError.set(this.itemDefinitions.length === 0);
    if (this.editForm.invalid || this.selectedKidLogins.size === 0 || this.itemDefinitions.length === 0) {
      return;
    }

    const formValue = this.editForm.getRawValue();
    this.isSaving.set(true);
    this.http
      .post('/api/family/objectives', {
        name: formValue.name ?? '',
        description: formValue.description?.trim() ? formValue.description : null,
        kidLogins: Array.from(this.selectedKidLogins),
        itemDefinitions: (formValue.itemDefinitions ?? []).map(item => ({
          name: item?.name ?? '',
          description: item?.description?.trim() ? item.description : null,
          unit: item?.unit ?? ObjectiveUnit.NUMBER,
        })),
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.activeModal.close('saved');
        },
        error: () => {
          this.isSaving.set(false);
        },
      });
  }

  get itemDefinitions(): FormArray {
    return this.editForm.get('itemDefinitions') as FormArray;
  }

  addItemDefinition(): void {
    this.itemDefinitions.push(this.createItemDefinitionFormGroup());
    this.itemsError.set(false);
  }

  removeItemDefinition(index: number): void {
    if (this.itemDefinitions.length === 1) {
      return;
    }
    this.itemDefinitions.removeAt(index);
    this.itemsError.set(this.itemDefinitions.length === 0);
  }

  toggleKid(login: string, checked: boolean): void {
    if (checked) {
      this.selectedKidLogins.add(login);
    } else {
      this.selectedKidLogins.delete(login);
    }
    this.selectionError.set(this.selectedKidLogins.size === 0);
  }

  isKidSelected(login: string): boolean {
    return this.selectedKidLogins.has(login);
  }

  getChildDisplayName(child: ChildUser): string {
    const fullName = `${child.firstName ?? ''} ${child.lastName ?? ''}`.trim();
    return fullName || child.login;
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

  private createItemDefinitionFormGroup() {
    return this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(1000)]],
      unit: [ObjectiveUnit.NUMBER, [Validators.required]],
    });
  }
}

