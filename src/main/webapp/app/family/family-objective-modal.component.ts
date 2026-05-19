import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';

import SharedModule from 'app/shared/shared.module';
import { ChildUser, FamilyObjective, ObjectiveMilestone, ObjectiveUnit } from './family.models';

@Component({
  selector: 'jhi-family-objective-modal',
  templateUrl: './family-objective-modal.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
})
export class FamilyObjectiveModalComponent implements OnInit {
  @Input() children: ChildUser[] = [];
  @Input() objective: FamilyObjective | null = null;
  @Input() objectiveIds: number[] = [];
  @Input() objectiveAssignments: Array<{ objectiveId: number; kidLogin: string }> = [];

  isSaving = signal(false);
  selectionError = signal(false);
  itemsError = signal(false);
  readonly units = Object.values(ObjectiveUnit);
  readonly milestones = Object.values(ObjectiveMilestone);

  protected readonly activeModal = inject(NgbActiveModal);
  private readonly http = inject(HttpClient);
  private readonly formBuilder = inject(FormBuilder);

  ngOnInit(): void {
    if (!this.objective) {
      return;
    }

    this.editForm.patchValue({
      name: this.objective.name,
      description: this.objective.description ?? '',
    });

    const itemForms = this.objective.itemDefinitions.map(item =>
      this.formBuilder.group({
        id: [item.id ?? null],
        name: [item.name, [Validators.required, Validators.maxLength(255)]],
        description: [item.description ?? '', [Validators.maxLength(1000)]],
        unit: [item.unit ?? ObjectiveUnit.NUMBER, [Validators.required]],
        target: [item.target ?? null],
        milestone: [item.milestone ?? null],
      }),
    );

    if (itemForms.length > 0) {
      this.editForm.setControl('itemDefinitions', this.formBuilder.array(itemForms));
    }

    const assignedKidLogins = this.objectiveAssignments.map(item => item.kidLogin).filter(Boolean);
    if (assignedKidLogins.length > 0) {
      this.selectedKidLogins = new Set(assignedKidLogins);
    } else if (this.objective.kidLogin) {
      this.selectedKidLogins = new Set([this.objective.kidLogin]);
    }
  }

  get isEditMode(): boolean {
    return this.objective !== null;
  }

  get modalTitleKey(): string {
    return this.isEditMode ? 'family.objectives.modal.editTitle' : 'family.objectives.modal.title';
  }

  get submitKey(): string {
    return this.isEditMode ? 'family.objectives.form.update' : 'family.objectives.form.save';
  }

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
    const payload = {
      name: formValue.name ?? '',
      description: formValue.description?.trim() ? formValue.description : null,
      itemDefinitions: (formValue.itemDefinitions ?? []).map(item => ({
        id: item?.id ?? null,
        name: item?.name ?? '',
        description: item?.description?.trim() ? item.description : null,
        unit: item?.unit ?? ObjectiveUnit.NUMBER,
        target: item?.target != null ? item.target : null,
        milestone: item?.milestone ?? null,
      })),
    };

    const request = this.isEditMode
      ? this.buildUpdateRequest(payload)
      : this.http.post('/api/family/objectives', {
          ...payload,
          kidLogins: Array.from(this.selectedKidLogins),
        });

    if (!request) {
      this.isSaving.set(false);
      return;
    }

    request.subscribe({
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
      case ObjectiveUnit.CHECKBOX:
        return 'Done / Not done';
      default:
        return 'Number';
    }
  }

  getMilestoneLabel(milestone: ObjectiveMilestone): string {
    switch (milestone) {
      case ObjectiveMilestone.WEEK:   return 'Weekly';
      case ObjectiveMilestone.MONTH:  return 'Monthly';
      case ObjectiveMilestone.QUARTER: return 'Quarterly';
      case ObjectiveMilestone.YEAR:   return 'Yearly';
      default: return milestone;
    }
  }

  private createItemDefinitionFormGroup() {
    return this.formBuilder.group({
      id: [null as number | null],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(1000)]],
      unit: [ObjectiveUnit.NUMBER, [Validators.required]],
      target: [null as number | null],
      milestone: [null as ObjectiveMilestone | null],
    });
  }

  private buildUpdateRequest(payload: {
    name: string;
    description: string | null;
    itemDefinitions: Array<{ id: number | null; name: string; description: string | null; unit: ObjectiveUnit; target: number | null; milestone: ObjectiveMilestone | null }>;
  }) {
    const selectedLogins = Array.from(this.selectedKidLogins);
    const currentAssignments = this.objectiveAssignments.length > 0
      ? this.objectiveAssignments
      : this.objective?.id && this.objective?.kidLogin
        ? [{ objectiveId: this.objective.id, kidLogin: this.objective.kidLogin }]
        : [];

    const assignmentByLogin = new Map<string, number[]>();
    for (const assignment of currentAssignments) {
      const existing = assignmentByLogin.get(assignment.kidLogin) ?? [];
      existing.push(assignment.objectiveId);
      assignmentByLogin.set(assignment.kidLogin, existing);
    }

    const requests = [];

    // Update objectives for kids that remain assigned.
    for (const login of selectedLogins) {
      const idsForLogin = assignmentByLogin.get(login);
      if (idsForLogin && idsForLogin.length > 0) {
        idsForLogin.forEach(id => requests.push(this.http.put(`/api/family/objectives/${id}`, payload)));
      } else {
        // Create a new objective for newly added kids.
        requests.push(this.http.post('/api/family/objectives', { ...payload, kidLogins: [login] }));
      }
    }

    // Remove objectives for kids that were unassigned.
    for (const [login, idsForLogin] of assignmentByLogin.entries()) {
      if (selectedLogins.includes(login)) {
        continue;
      }
      idsForLogin.forEach(id => requests.push(this.http.delete(`/api/family/objectives/${id}`)));
    }

    if (requests.length === 0) {
      return null;
    }
    if (requests.length <= 1) {
      return requests[0];
    }
    return forkJoin(requests);
  }
}

