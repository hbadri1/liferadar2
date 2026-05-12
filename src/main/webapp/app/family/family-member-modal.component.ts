import { Component, Input, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';

type FamilyMemberMode = 'child' | 'parent';

@Component({
  selector: 'jhi-family-member-modal',
  templateUrl: './family-member-modal.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
})
export class FamilyMemberModalComponent {
  @Input() mode: FamilyMemberMode = 'child';

  private readonly formBuilder = inject(FormBuilder);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  readonly form = this.formBuilder.group({
    login: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$/),
      ],
    ],
    firstName: ['', [Validators.maxLength(50)]],
    email: ['', [Validators.email, Validators.minLength(5), Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
  });

  protected readonly activeModal = inject(NgbActiveModal);
  private readonly http = inject(HttpClient);

  get titleKey(): string {
    return this.mode === 'parent' ? 'family.addParent' : 'family.addChild';
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const rawValue = this.form.getRawValue();
    const payload = {
      login: rawValue.login,
      firstName: rawValue.firstName?.trim() ? rawValue.firstName : null,
      email: rawValue.email?.trim() ? rawValue.email : null,
      password: rawValue.password,
    };

    const resource = this.mode === 'parent' ? '/api/family/parents' : '/api/family/children';

    this.http.post(resource, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.activeModal.close('saved');
      },
      error: err => {
        this.isSaving.set(false);
        this.errorMessage.set(err?.error?.detail ?? err?.error?.title ?? 'family.error.save');
      },
    });
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}
