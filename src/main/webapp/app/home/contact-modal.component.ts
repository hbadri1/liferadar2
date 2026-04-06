import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import SharedModule from 'app/shared/shared.module';
import { ContactService } from './contact.service';

@Component({
  selector: 'jhi-contact-modal',
  templateUrl: './contact-modal.component.html',
  standalone: true,
  imports: [SharedModule, ReactiveFormsModule],
})
export class ContactModalComponent implements OnInit {
  form!: FormGroup;
  isSending = signal(false);
  sent = signal(false);
  error = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);
  protected readonly activeModal = inject(NgbActiveModal);

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    });
  }

  get nameInvalid(): boolean {
    const ctrl = this.form.get('name');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get emailInvalid(): boolean {
    const ctrl = this.form.get('email');
    return !!(ctrl?.invalid && ctrl?.touched && ctrl?.value);
  }

  get messageInvalid(): boolean {
    const ctrl = this.form.get('message');
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get messageLength(): number {
    return this.form.get('message')?.value?.length ?? 0;
  }

  send(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSending.set(true);
    this.error.set(false);

    const { name, email, message } = this.form.value;
    this.contactService.send({ name, email: email || undefined, message }).subscribe({
      next: () => {
        this.isSending.set(false);
        this.sent.set(true);
      },
      error: () => {
        this.isSending.set(false);
        this.error.set(true);
      },
    });
  }

  close(): void {
    this.activeModal.close();
  }
}

