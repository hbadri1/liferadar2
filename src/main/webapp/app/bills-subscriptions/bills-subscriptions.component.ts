import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs/esm';

import SharedModule from 'app/shared/shared.module';
import { AlertService } from 'app/core/util/alert.service';
import {
  BillingCycle,
  ISaaSSubscription,
  PaymentMethod,
  RenewalReminderOption,
  SubscriptionStatus,
} from 'app/entities/saas-subscription/saas-subscription.model';
import { SaaSSubscriptionService } from 'app/entities/saas-subscription/service/saas-subscription.service';
import { ConfirmationModalComponent } from 'app/home/confirmation-modal.component';

@Component({
  selector: 'jhi-bills-subscriptions',
  templateUrl: './bills-subscriptions.component.html',
  styleUrl: './bills-subscriptions.component.scss',
  imports: [SharedModule, CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
})
export default class BillsSubscriptionsComponent implements OnInit {
  private readonly subscriptionService = inject(SaaSSubscriptionService);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);
  private readonly modalService = inject(NgbModal);
  private readonly translateService = inject(TranslateService);

  readonly billingCycleOptions = Object.values(BillingCycle);
  readonly renewalReminderOptions = Object.values(RenewalReminderOption);
  readonly paymentMethodOptions = Object.values(PaymentMethod);
  readonly statusOptions = Object.values(SubscriptionStatus);

  expenses: ISaaSSubscription[] = [];
  isLoading = false;
  editingExpenseId: number | null = null;
  searchTerm = '';
  statusFilter = 'ALL';

  readonly editForm = new FormGroup({
    serviceName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    amount: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    currency: new FormControl('SAR', { nonNullable: true, validators: [Validators.required] }),
    subscriptionDate: new FormControl(dayjs().format('YYYY-MM-DD'), { nonNullable: true, validators: [Validators.required] }),
    billingCycle: new FormControl(BillingCycle.MONTHLY, { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl(SubscriptionStatus.ACTIVE, { nonNullable: true, validators: [Validators.required] }),
    dueDate: new FormControl<string | null>(null),
    paidDate: new FormControl<string | null>(null),
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

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.isLoading = true;
    this.subscriptionService.queryMy().subscribe({
      next: res => {
        this.expenses = [...(res.body ?? [])].sort((a, b) => this.getSortDate(b).valueOf() - this.getSortDate(a).valueOf());
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.alertService.addAlert({ type: 'danger', message: this.translateService.instant('billsSubscriptions.expenseLoadError') });
      },
    });
  }

  get filteredExpenses(): ISaaSSubscription[] {
    return this.expenses.filter(expense => {
      const matchesSearch =
        !this.searchTerm.trim() ||
        `${expense.serviceName} ${expense.description ?? ''} ${expense.notes ?? ''}`.toLowerCase().includes(this.searchTerm.trim().toLowerCase());
      const matchesStatus = this.statusFilter === 'ALL' || expense.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get totalExpenses(): number {
    return this.expenses.length;
  }

  get overdueExpenses(): number {
    return this.expenses.filter(expense => expense.status === SubscriptionStatus.OVERDUE).length;
  }

  get upcomingRenewals(): number {
    const limit = dayjs().add(30, 'day');
    return this.expenses.filter(expense => expense.renewalDate && expense.renewalDate.isAfter(dayjs().subtract(1, 'day')) && expense.renewalDate.isBefore(limit.add(1, 'day'))).length;
  }

  get trackedSpendSar(): number {
    return this.roundToTwoDecimals(
      this.expenses
        .filter(expense => expense.status === SubscriptionStatus.PAID)
        .reduce((sum, expense) => sum + this.convertToSar(expense.monthlyCost ?? 0, expense.currency), 0)
    );
  }

  createExpense(): void {
    this.router.navigate(['/entities/expense/new']);
  }

  startEdit(expense: ISaaSSubscription): void {
    if (expense.status === SubscriptionStatus.PAID) {
      return;
    }
    this.editingExpenseId = expense.id ?? null;
    this.editForm.reset({
      serviceName: expense.serviceName,
      amount: expense.monthlyCost,
      currency: expense.currency,
      subscriptionDate: expense.subscriptionDate.format('YYYY-MM-DD'),
      billingCycle: expense.billingCycle,
      status: expense.status,
      dueDate: expense.dueDate?.format('YYYY-MM-DD') ?? null,
      paidDate: expense.paidDate?.format('YYYY-MM-DD') ?? null,
      autoRenewal: expense.autoRenewal ?? false,
      manualRenewal: expense.manualRenewal ?? false,
      renewalReminder: expense.renewalReminder ?? null,
      paymentMethod: expense.paymentMethod ?? null,
      description: expense.description ?? null,
      providerUrl: expense.providerUrl ?? null,
      accountEmail: expense.accountEmail ?? null,
      accountUsername: expense.accountUsername ?? null,
      notes: expense.notes ?? null,
    });
  }

  cancelEdit(): void {
    this.editingExpenseId = null;
  }

  saveEdit(): void {
    if (!this.editingExpenseId || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    const existing = this.expenses.find(expense => expense.id === this.editingExpenseId);
    if (!existing) {
      return;
    }

    const raw = this.editForm.getRawValue();
    const subscriptionDate = dayjs(raw.subscriptionDate);

    const updated: ISaaSSubscription = {
      ...existing,
      serviceName: raw.serviceName,
      description: raw.description,
      monthlyCost: raw.amount,
      annualCost: existing.annualCost ?? raw.amount,
      currency: raw.currency,
      billDate: existing.billDate ?? subscriptionDate,
      dueDate: raw.dueDate ? dayjs(raw.dueDate) : null,
      paidDate: raw.paidDate ? dayjs(raw.paidDate) : null,
      subscriptionDate,
      renewalDate: this.calculateRenewalDate(subscriptionDate, raw.billingCycle),
      billingCycle: raw.billingCycle,
      status: raw.status,
      autoRenewal: raw.autoRenewal,
      manualRenewal: raw.manualRenewal,
      renewalReminder: raw.autoRenewal || raw.manualRenewal ? raw.renewalReminder : null,
      receiptUrl: existing.receiptUrl ?? null,
      paymentMethod: raw.paymentMethod,
      providerUrl: raw.providerUrl,
      accountEmail: raw.accountEmail,
      accountUsername: raw.accountUsername,
      notes: raw.notes,
      isShared: existing.isShared ?? false,
    };

    this.subscriptionService.update(updated).subscribe({
      next: () => {
        this.alertService.addAlert({ type: 'success', message: this.translateService.instant('billsSubscriptions.expenseUpdatedSuccess') });
        this.editingExpenseId = null;
        this.loadExpenses();
      },
      error: () => {
        this.alertService.addAlert({ type: 'danger', message: this.translateService.instant('billsSubscriptions.expenseUpdateError') });
      },
    });
  }

  markAsPaid(expense: ISaaSSubscription): void {
    if (!expense.id) {
      return;
    }

    this.subscriptionService
      .update({
        ...expense,
        status: SubscriptionStatus.PAID,
        paidDate: dayjs(),
      })
      .subscribe({
        next: () => {
          this.alertService.addAlert({ type: 'success', message: this.translateService.instant('billsSubscriptions.expenseMarkedPaidSuccess') });
          this.loadExpenses();
        },
        error: () => {
          this.alertService.addAlert({ type: 'danger', message: this.translateService.instant('billsSubscriptions.expenseStatusUpdateError') });
        },
      });
  }

  deleteExpense(expense: ISaaSSubscription): void {
    if (!expense.id || expense.status === SubscriptionStatus.PAID) {
      return;
    }

    const modalRef = this.modalService.open(ConfirmationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.title = this.translateService.instant('billsSubscriptions.deleteExpenseTitle');
    modalRef.componentInstance.message = this.translateService.instant('billsSubscriptions.deleteExpenseConfirm', { serviceName: expense.serviceName });
    modalRef.componentInstance.confirmButtonText = this.translateService.instant('entity.action.delete');
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.closed.subscribe(result => {
      if (result !== 'confirmed') {
        return;
      }

      this.subscriptionService.delete(expense.id!).subscribe({
        next: () => {
          this.alertService.addAlert({ type: 'success', message: this.translateService.instant('billsSubscriptions.expenseDeletedSuccess') });
          this.loadExpenses();
        },
        error: () => {
          this.alertService.addAlert({ type: 'danger', message: this.translateService.instant('billsSubscriptions.expenseDeleteError') });
        },
      });
    });
  }

  getPrimaryDate(expense: ISaaSSubscription): string {
    const value = expense.dueDate ?? expense.renewalDate ?? expense.subscriptionDate;
    return value ? value.format('YYYY-MM-DD') : '—';
  }

  getSecondaryDetails(expense: ISaaSSubscription): string {
    const values: string[] = [];
    if (expense.billingCycle) {
      values.push(this.translateService.instant(`billsSubscriptions.billingCycleValues.${expense.billingCycle}`));
    }
    if (expense.paymentMethod) {
      values.push(this.translateService.instant(`billsSubscriptions.paymentMethodValues.${expense.paymentMethod}`));
    }
    if (expense.autoRenewal) {
      values.push(this.translateService.instant('billsSubscriptions.autoRenewal'));
    }
    if (expense.manualRenewal) {
      values.push(this.translateService.instant('billsSubscriptions.manualRenewal'));
    }

    return values.length > 0 ? values.join(' • ') : '—';
  }

  getStatusClass(status: SubscriptionStatus): string {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
      case SubscriptionStatus.PAID:
        return 'bg-success-subtle text-success';
      case SubscriptionStatus.OVERDUE:
      case SubscriptionStatus.EXPIRED:
        return 'bg-danger-subtle text-danger';
      case SubscriptionStatus.PENDING:
      case SubscriptionStatus.NEW:
      case SubscriptionStatus.PARTIAL:
        return 'bg-warning-subtle text-warning';
      default:
        return 'bg-secondary-subtle text-secondary';
    }
  }

  formatAmount(expense: ISaaSSubscription): string {
    return `${this.roundToTwoDecimals(expense.monthlyCost)} ${expense.currency}`;
  }

  trackById(_: number, expense: ISaaSSubscription): number | undefined {
    return expense.id;
  }

  private getSortDate(expense: ISaaSSubscription): dayjs.Dayjs {
    return expense.dueDate ?? expense.renewalDate ?? expense.subscriptionDate ?? dayjs();
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

  private convertToSar(amount: number, currency?: string | null): number {
    return currency === 'USD' ? amount * 3.75 : amount;
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
