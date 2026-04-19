import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import dayjs from 'dayjs/esm';

import SharedModule from 'app/shared/shared.module';
import { BillService } from 'app/entities/bill/service/bill.service';
import { BillStatus, NewBill, PaymentMethod } from 'app/entities/bill/bill.model';

@Component({
  selector: 'jhi-bill-create',
  template: `
    <section class="container py-4">
      <header class="mb-4">
        <h1 class="h3 mb-1">Add Bill</h1>
        <p class="text-muted mb-0">Create a new bill and track its due date and payment status.</p>
      </header>

      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="card mb-3">
          <div class="card-body row g-3">
            <div class="col-md-8">
              <label for="description" class="form-label">Provider</label>
              <input id="description" type="text" class="form-control" formControlName="description" />
            </div>

            <div class="col-md-4">
              <label for="amount" class="form-label">Amount</label>
              <input id="amount" type="number" min="0" step="0.01" class="form-control" formControlName="amount" />
            </div>

            <div class="col-md-4">
              <label for="billDate" class="form-label">Bill Date</label>
              <input id="billDate" type="date" class="form-control" formControlName="billDate" />
            </div>

            <div class="col-md-4">
              <label for="dueDate" class="form-label">Due Date</label>
              <input id="dueDate" type="date" class="form-control" formControlName="dueDate" />
            </div>

            <div class="col-md-4">
              <label for="status" class="form-label">Status</label>
              <select id="status" class="form-select" formControlName="status">
                @for (option of statusOptions; track option) {
                  <option [value]="option">{{ option }}</option>
                }
              </select>
            </div>

            <div class="col-md-6">
              <label for="paymentMethod" class="form-label">Payment Method</label>
              <select id="paymentMethod" class="form-select" formControlName="paymentMethod">
                @for (option of paymentMethodOptions; track option) {
                  <option [value]="option">{{ option }}</option>
                }
              </select>
            </div>

            <div class="col-md-6 d-flex align-items-end">
              <div class="form-check mb-2">
                <input id="isRecurring" class="form-check-input" type="checkbox" formControlName="isRecurring" />
                <label class="form-check-label" for="isRecurring">Recurring bill</label>
              </div>
            </div>

            <div class="col-12">
              <label for="notes" class="form-label">Notes</label>
              <textarea id="notes" rows="3" class="form-control" formControlName="notes"></textarea>
            </div>
          </div>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-danger" role="alert">{{ errorMessage() }}</div>
        }

        <div class="d-flex gap-2">
          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || isSaving()">Save Bill</button>
          <button class="btn btn-outline-secondary" type="button" (click)="cancel()" [disabled]="isSaving()">Cancel</button>
        </div>
      </form>
    </section>
  `,
  imports: [SharedModule, CommonModule, ReactiveFormsModule, RouterModule],
})
export default class BillCreateComponent {
  private readonly billService = inject(BillService);
  private readonly router = inject(Router);

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly statusOptions = Object.values(BillStatus);
  readonly paymentMethodOptions = Object.values(PaymentMethod);

  readonly form = new FormGroup({
    description: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    amount: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    billDate: new FormControl(dayjs().format('YYYY-MM-DD'), { nonNullable: true, validators: [Validators.required] }),
    dueDate: new FormControl<string | null>(null),
    status: new FormControl(BillStatus.PENDING, { nonNullable: true, validators: [Validators.required] }),
    paymentMethod: new FormControl(PaymentMethod.BANK_TRANSFER, { nonNullable: true, validators: [Validators.required] }),
    notes: new FormControl<string | null>(null),
    isRecurring: new FormControl(false, { nonNullable: true }),
  });

  save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const payload: NewBill = {
      description: raw.description,
      amount: raw.amount,
      billDate: dayjs(raw.billDate),
      dueDate: raw.dueDate ? dayjs(raw.dueDate) : null,
      paidDate: null,
      status: raw.status,
      paymentMethod: raw.paymentMethod,
      notes: raw.notes,
      isRecurring: raw.isRecurring,
    };

    this.billService.create(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/bills-subscriptions']);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Unable to create bill. Please review the form and try again.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/bills-subscriptions']);
  }
}

