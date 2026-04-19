import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import dayjs from 'dayjs/esm';

import SharedModule from 'app/shared/shared.module';
import { SaaSSubscriptionService } from 'app/entities/saas-subscription/service/saas-subscription.service';
import { BillingCycle, NewSaaSSubscription, SubscriptionStatus } from 'app/entities/saas-subscription/saas-subscription.model';

@Component({
  selector: 'jhi-saas-subscription-create',
  template: `
    <section class="container py-4">
      <header class="mb-4">
        <h1 class="h3 mb-1">Add Subscription</h1>
        <p class="text-muted mb-0">Create a SaaS subscription entry and track renewal details.</p>
      </header>

      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="card mb-3">
          <div class="card-body row g-3">
            <div class="col-md-8">
              <label for="serviceName" class="form-label">Service Name</label>
              <input id="serviceName" type="text" class="form-control" formControlName="serviceName" />
            </div>

            <div class="col-md-4">
              <label for="cost" class="form-label">Cost</label>
              <input id="cost" type="number" min="0" step="0.01" class="form-control" formControlName="cost" />
            </div>

            <div class="col-md-4">
              <label for="subscriptionDate" class="form-label">Subscription Date</label>
              <input id="subscriptionDate" type="date" class="form-control" formControlName="subscriptionDate" />
            </div>

            <div class="col-md-4">
              <label for="billingCycle" class="form-label">Billing Cycle</label>
              <select id="billingCycle" class="form-select" formControlName="billingCycle">
                @for (option of billingCycleOptions; track option) {
                  <option [value]="option">{{ option }}</option>
                }
              </select>
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
              <label for="providerUrl" class="form-label">Provider URL</label>
              <input id="providerUrl" type="url" class="form-control" formControlName="providerUrl" />
            </div>

            <div class="col-md-3">
              <label for="accountEmail" class="form-label">Account Email</label>
              <input id="accountEmail" type="email" class="form-control" formControlName="accountEmail" />
            </div>

            <div class="col-md-3">
              <label for="accountUsername" class="form-label">Account Username</label>
              <input id="accountUsername" type="text" class="form-control" formControlName="accountUsername" />
            </div>

            <div class="col-12">
              <label for="description" class="form-label">Description</label>
              <textarea id="description" rows="2" class="form-control" formControlName="description"></textarea>
            </div>

            <div class="col-12">
              <label for="notes" class="form-label">Notes</label>
              <textarea id="notes" rows="3" class="form-control" formControlName="notes"></textarea>
            </div>

            <div class="col-12">
              <div class="form-check mb-2">
                <input id="isShared" class="form-check-input" type="checkbox" formControlName="isShared" />
                <label class="form-check-label" for="isShared">Shared subscription</label>
              </div>
            </div>
          </div>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-danger" role="alert">{{ errorMessage() }}</div>
        }

        <div class="d-flex gap-2">
          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || isSaving()">Save Subscription</button>
          <button class="btn btn-outline-secondary" type="button" (click)="cancel()" [disabled]="isSaving()">Cancel</button>
        </div>
      </form>
    </section>
  `,
  imports: [SharedModule, CommonModule, ReactiveFormsModule, RouterModule],
})
export default class SaaSSubscriptionCreateComponent {
  private readonly subscriptionService = inject(SaaSSubscriptionService);
  private readonly router = inject(Router);

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly billingCycleOptions = Object.values(BillingCycle);
  readonly statusOptions = Object.values(SubscriptionStatus);

  readonly form = new FormGroup({
    serviceName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    cost: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    subscriptionDate: new FormControl(dayjs().format('YYYY-MM-DD'), { nonNullable: true, validators: [Validators.required] }),
    billingCycle: new FormControl(BillingCycle.MONTHLY, { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl(SubscriptionStatus.ACTIVE, { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl<string | null>(null),
    providerUrl: new FormControl<string | null>(null),
    accountEmail: new FormControl<string | null>(null),
    accountUsername: new FormControl<string | null>(null),
    notes: new FormControl<string | null>(null),
    isShared: new FormControl(false, { nonNullable: true }),
  });

  save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const subscriptionDate = dayjs(raw.subscriptionDate);
    const renewalDate = this.calculateRenewalDate(subscriptionDate, raw.billingCycle);

    const payload: NewSaaSSubscription = {
      serviceName: raw.serviceName,
      description: raw.description,
      monthlyCost: raw.cost,
      subscriptionDate,
      renewalDate,
      billingCycle: raw.billingCycle,
      status: raw.status,
      providerUrl: raw.providerUrl,
      accountEmail: raw.accountEmail,
      accountUsername: raw.accountUsername,
      notes: raw.notes,
      isShared: raw.isShared,
    };

    this.subscriptionService.create(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/bills-subscriptions']);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Unable to create subscription. Please review the form and try again.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/bills-subscriptions']);
  }

  private calculateRenewalDate(subscriptionDate: dayjs.Dayjs, billingCycle: BillingCycle): dayjs.Dayjs {
    switch (billingCycle) {
      case BillingCycle.WEEKLY:
        return subscriptionDate.add(1, 'week');
      case BillingCycle.MONTHLY:
        return subscriptionDate.add(1, 'month');
      case BillingCycle.QUARTERLY:
        return subscriptionDate.add(3, 'month');
      case BillingCycle.SEMI_ANNUAL:
        return subscriptionDate.add(6, 'month');
      case BillingCycle.ANNUAL:
        return subscriptionDate.add(1, 'year');
      default:
        return subscriptionDate.add(1, 'month');
    }
  }
}

