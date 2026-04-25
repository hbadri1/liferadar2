import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs/esm';

import SharedModule from 'app/shared/shared.module';
import { SaaSSubscriptionService } from 'app/entities/saas-subscription/service/saas-subscription.service';
import {
  BillingCycle,
  NewSaaSSubscription,
  PaymentMethod,
  RenewalReminderOption,
  SubscriptionStatus,
} from 'app/entities/saas-subscription/saas-subscription.model';

@Component({
  selector: 'jhi-saas-subscription-create',
  template: `
    <section class="container py-4">
      <header class="mb-4">
        <h1 class="h3 mb-1" jhiTranslate="billsSubscriptions.newExpense">Add Expense</h1>
        <p class="text-muted mb-0" jhiTranslate="billsSubscriptions.createExpenseSubtitle">Create a new expense item.</p>
      </header>

      <form [formGroup]="form" (ngSubmit)="save()" novalidate>

        <!-- Group 1: Name, Amount & Currency -->
        <div class="card mb-3">
          <div class="card-header py-2 fw-semibold small text-muted" jhiTranslate="billsSubscriptions.groupBasicInfo">Name &amp; Amount</div>
          <div class="card-body row g-2">
            <div class="col-md-6">
              <label for="serviceName" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.serviceName">Name</label>
              <input id="serviceName" type="text" class="form-control form-control-sm" formControlName="serviceName" />
            </div>

            <div class="col-md-3">
              <label for="amount" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.amount">Amount</label>
              <input id="amount" type="number" min="0" step="0.01" class="form-control form-control-sm" formControlName="amount" />
            </div>

            <div class="col-md-2">
              <label for="currency" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.currency">Currency</label>
              <select id="currency" class="form-select form-select-sm" formControlName="currency">
                @for (option of currencyOptions; track option) {
                  <option [value]="option">{{ option }}</option>
                }
              </select>
            </div>

            <div class="col-md-1 d-flex align-items-end pb-1">
              @if (form.controls.currency.value === 'USD') {
                <button type="button" class="btn btn-outline-success btn-sm w-100" (click)="convertUsdToSar()" title="{{ 'billsSubscriptions.convertUsdToSar' | translate }}">⇄</button>
              }
            </div>
          </div>
        </div>

        <!-- Group 2: Dates, Renewals & Payment Method -->
        <div class="card mb-3">
          <div class="card-header py-2 fw-semibold small text-muted" jhiTranslate="billsSubscriptions.groupDatesRenewals">Dates, Renewals &amp; Payment</div>
          <div class="card-body row g-2">
            <div class="col-md-4">
              <label for="subscriptionDate" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.startDate">Start Date</label>
              <input id="subscriptionDate" type="date" class="form-control form-control-sm" formControlName="subscriptionDate" />
            </div>

            <div class="col-md-4">
              <label for="dueDate" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.dueDate">Due Date</label>
              <input id="dueDate" type="date" class="form-control form-control-sm" formControlName="dueDate" />
            </div>

            <div class="col-md-4">
              <label for="billingCycle" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.billingCycle">Billing Cycle</label>
              <select id="billingCycle" class="form-select form-select-sm" formControlName="billingCycle">
                @for (option of billingCycleOptions; track option) {
                  <option [value]="option">{{ ('billsSubscriptions.billingCycleValues.' + option) | translate }}</option>
                }
              </select>
            </div>

            <div class="col-md-4">
              <label for="paymentMethod" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.paymentMethod">Payment Method</label>
              <select id="paymentMethod" class="form-select form-select-sm" formControlName="paymentMethod">
                <option [ngValue]="null" jhiTranslate="billsSubscriptions.none">None</option>
                @for (option of paymentMethodOptions; track option) {
                  <option [ngValue]="option">{{ ('billsSubscriptions.paymentMethodValues.' + option) | translate }}</option>
                }
              </select>
            </div>

            <div class="col-md-4">
              <label for="renewalReminder" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.notify">Notify</label>
              <select
                id="renewalReminder"
                class="form-select form-select-sm"
                formControlName="renewalReminder"
                [disabled]="!form.controls.autoRenewal.value && !form.controls.manualRenewal.value"
              >
                <option [ngValue]="null" jhiTranslate="billsSubscriptions.noReminder">No reminder</option>
                @for (option of renewalReminderOptions; track option) {
                  <option [ngValue]="option">{{ getRenewalReminderLabel(option) }}</option>
                }
              </select>
            </div>

            <div class="col-md-4 d-flex align-items-end gap-3 pb-1">
              <div class="form-check">
                <input id="autoRenewal" class="form-check-input" type="checkbox" formControlName="autoRenewal" />
                <label class="form-check-label small" for="autoRenewal" jhiTranslate="billsSubscriptions.autoRenewal">Auto-renewal</label>
              </div>
              <div class="form-check">
                <input id="manualRenewal" class="form-check-input" type="checkbox" formControlName="manualRenewal" />
                <label class="form-check-label small" for="manualRenewal" jhiTranslate="billsSubscriptions.manualRenewal">Manual-renewal</label>
              </div>
            </div>
          </div>
        </div>

        <!-- Group 3: Details -->
        <div class="card mb-3">
          <div class="card-header py-2 fw-semibold small text-muted" jhiTranslate="billsSubscriptions.groupDetails">Details</div>
          <div class="card-body row g-2">
            <div class="col-md-5">
              <label for="providerUrl" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.providerUrl">Provider URL</label>
              <input id="providerUrl" type="url" class="form-control form-control-sm" formControlName="providerUrl" />
            </div>

            <div class="col-md-4">
              <label for="accountEmail" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.accountEmail">Account Email</label>
              <input id="accountEmail" type="email" class="form-control form-control-sm" formControlName="accountEmail" />
            </div>

            <div class="col-md-3">
              <label for="accountUsername" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.accountUsername">Account Username</label>
              <input id="accountUsername" type="text" class="form-control form-control-sm" formControlName="accountUsername" />
            </div>

            <div class="col-12">
              <label for="description" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.description">Description</label>
              <textarea id="description" rows="2" class="form-control form-control-sm" formControlName="description"></textarea>
            </div>

            <div class="col-12">
              <label for="notes" class="form-label form-label-sm mb-1" jhiTranslate="billsSubscriptions.notes">Notes</label>
              <textarea id="notes" rows="2" class="form-control form-control-sm" formControlName="notes"></textarea>
            </div>
          </div>
        </div>

        @if (errorMessage()) {
          <div class="alert alert-danger" role="alert">{{ errorMessage() }}</div>
        }

        <div class="d-flex gap-2">
          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || isSaving()" jhiTranslate="billsSubscriptions.saveExpense">Save Expense</button>
          <button class="btn btn-outline-secondary" type="button" (click)="cancel()" [disabled]="isSaving()" jhiTranslate="entity.action.cancel">Cancel</button>
        </div>
      </form>
    </section>
  `,
  imports: [SharedModule, CommonModule, ReactiveFormsModule, RouterModule],
})
export default class SaaSSubscriptionCreateComponent {
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly billingCycleOptions = Object.values(BillingCycle);
  readonly renewalReminderOptions = Object.values(RenewalReminderOption);
  readonly currencyOptions = ['USD', 'SAR'];
  readonly paymentMethodOptions = Object.values(PaymentMethod);

  readonly form = new FormGroup({
    serviceName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    amount: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    currency: new FormControl('SAR', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(3)] }),
    subscriptionDate: new FormControl(dayjs().format('YYYY-MM-DD'), { nonNullable: true, validators: [Validators.required] }),
    billingCycle: new FormControl(BillingCycle.MONTHLY, { nonNullable: true, validators: [Validators.required] }),
    dueDate: new FormControl<string | null>(null),
    autoRenewal: new FormControl(false, { nonNullable: true }),
    manualRenewal: new FormControl(false, { nonNullable: true }),
    renewalReminder: new FormControl<RenewalReminderOption | null>(null),
    paymentMethod: new FormControl<PaymentMethod | null>(null),
    description: new FormControl<string | null>(null),
    providerUrl: new FormControl<string | null>(null),
    accountEmail: new FormControl<string | null>(null),
    accountUsername: new FormControl<string | null>(null),
    notes: new FormControl<string | null>(null),
  });

  private readonly subscriptionService = inject(SaaSSubscriptionService);
  private readonly router = inject(Router);
  private readonly translateService = inject(TranslateService);

  save(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const subscriptionDate = dayjs(raw.subscriptionDate);

    const payload: NewSaaSSubscription = {
      serviceName: raw.serviceName,
      description: raw.description,
      monthlyCost: raw.amount,
      currency: raw.currency,
      annualCost: null,
      billDate: subscriptionDate,
      dueDate: raw.dueDate ? dayjs(raw.dueDate) : null,
      paidDate: null,
      subscriptionDate,
      renewalDate: this.calculateRenewalDate(subscriptionDate, raw.billingCycle),
      billingCycle: raw.billingCycle,
      status: SubscriptionStatus.NEW,
      autoRenewal: raw.autoRenewal,
      manualRenewal: raw.manualRenewal,
      renewalReminder: raw.autoRenewal || raw.manualRenewal ? raw.renewalReminder : null,
      receiptUrl: null,
      paymentMethod: raw.paymentMethod,
      providerUrl: raw.providerUrl,
      accountEmail: raw.accountEmail,
      accountUsername: raw.accountUsername,
      notes: raw.notes,
      isShared: false,
    };

    this.subscriptionService.create(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/expenses']);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set(this.translateService.instant('billsSubscriptions.expenseCreateError'));
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/expenses']);
  }

  getRenewalReminderLabel(option: RenewalReminderOption): string {
    return this.translateService.instant(`billsSubscriptions.renewalReminderValues.${option}`);
  }

  convertUsdToSar(): void {
    if (this.form.controls.currency.value !== 'USD') {
      return;
    }

    const convertedCost = this.roundToTwoDecimals(this.form.controls.amount.value * 3.75);
    this.form.patchValue({ amount: convertedCost, currency: 'SAR' });
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
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

