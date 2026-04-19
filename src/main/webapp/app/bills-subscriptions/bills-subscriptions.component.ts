import { Component, OnInit, OnDestroy, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map, filter, tap } from 'rxjs/operators';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faClock, faCheckCircle, faTimes, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { AlertService } from 'app/core/util/alert.service';
import { BillingCycle, ISaaSSubscription, SubscriptionMetrics, SubscriptionStatus } from 'app/entities/saas-subscription/saas-subscription.model';
import { IBill, BillMetrics, BillStatus, PaymentMethod } from 'app/entities/bill/bill.model';
import { SaaSSubscriptionService } from 'app/entities/saas-subscription/service/saas-subscription.service';
import { BillService } from 'app/entities/bill/service/bill.service';
import dayjs from 'dayjs/esm';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmationModalComponent } from 'app/home/confirmation-modal.component';
import { ITickTickProjectModalResult, TickTickProjectModalComponent } from 'app/entities/evaluation-decision/list/ticktick-project-modal.component';

@Component({
  selector: 'jhi-bills-subscriptions',
  templateUrl: './bills-subscriptions.component.html',
  styleUrl: './bills-subscriptions.component.scss',
  imports: [SharedModule, CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgbModule, FaIconComponent],
})
export default class BillsSubscriptionsComponent implements OnInit, OnDestroy {
  private readonly subscriptionService = inject(SaaSSubscriptionService);
  private readonly billService = inject(BillService);
  private readonly modalService = inject(NgbModal);
  private readonly accountService = inject(AccountService);
  private readonly translateService = inject(TranslateService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  subscriptions$ = new Observable<ISaaSSubscription[]>();
  bills$ = new Observable<IBill[]>();
  subscriptionMetrics$ = new Observable<SubscriptionMetrics>();
  billMetrics$ = new Observable<BillMetrics>();
  pendingBills$ = new Observable<IBill[]>();
  overdueBills$ = new Observable<IBill[]>();
  upcomingRenewals$ = new Observable<ISaaSSubscription[]>();

  // Icons
  faClockIcon = faClock;
  faCheckIcon = faCheckCircle;
  faTimesIcon = faTimes;
  faDollarIcon = faDollarSign;

  activeTab = 'subscriptions';
  isLoading = false;
  userTimezone = 'UTC';
  userCurrency = 'USD';
  userLocale = 'en-US';

  isSavingBill = false;
  billToDelete: IBill | null = null;
  billToMarkPaid: IBill | null = null;
  subscriptionToDelete: ISaaSSubscription | null = null;
  editingBillId: number | null = null;
  private editingBill: IBill | null = null;
  editingSubscriptionId: number | null = null;
  private editingSubscription: ISaaSSubscription | null = null;

  readonly billStatusOptions = Object.values(BillStatus);
  readonly paymentMethodOptions = Object.values(PaymentMethod);
  readonly subscriptionStatusOptions = Object.values(SubscriptionStatus);
  readonly billingCycleOptions = Object.values(BillingCycle);
  readonly integrationProviders = [
    { code: 'ticktick', labelKey: 'liferadarApp.evaluationDecision.integrations.ticktick', style: 'btn-outline-primary' },
    { code: 'microsoft-todo', labelKey: 'liferadarApp.evaluationDecision.integrations.microsoftTodo', style: 'btn-outline-info' },
    { code: 'todoist', labelKey: 'liferadarApp.evaluationDecision.integrations.todoist', style: 'btn-outline-secondary' },
  ];

  private integrationPushingKeys = new Set<string>();

  readonly billEditForm = new FormGroup({
    description: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    amount: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    billDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    dueDate: new FormControl<string | null>(null),
    status: new FormControl(BillStatus.PENDING, { nonNullable: true, validators: [Validators.required] }),
    paymentMethod: new FormControl(PaymentMethod.BANK_TRANSFER, { nonNullable: true, validators: [Validators.required] }),
    notes: new FormControl<string | null>(null),
    isRecurring: new FormControl(false, { nonNullable: true }),
  });

  readonly subscriptionEditForm = new FormGroup({
    serviceName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    monthlyCost: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    subscriptionDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    billingCycle: new FormControl(BillingCycle.MONTHLY, { nonNullable: true, validators: [Validators.required] }),
    status: new FormControl(SubscriptionStatus.ACTIVE, { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl<string | null>(null),
    providerUrl: new FormControl<string | null>(null),
    accountEmail: new FormControl<string | null>(null),
    accountUsername: new FormControl<string | null>(null),
    notes: new FormControl<string | null>(null),
    isShared: new FormControl(false, { nonNullable: true }),
  });

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadData();
    this.loadUserPreferences();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.isLoading = true;
    this.subscriptions$ = this.subscriptionService.queryMy().pipe(map(res => res.body || []));
    this.bills$ = this.billService.queryMy().pipe(map(res => res.body || []));
    this.subscriptionMetrics$ = this.subscriptionService.getMetrics().pipe(map(res => res.body as SubscriptionMetrics));
    this.billMetrics$ = this.billService.getMetrics().pipe(map(res => res.body as BillMetrics));
    this.pendingBills$ = this.billService.getPendingBills().pipe(map(res => res.body || []));
    this.overdueBills$ = this.billService.getOverdueBills().pipe(map(res => res.body || []));
    this.upcomingRenewals$ = this.subscriptionService.getUpcomingRenewals(30).pipe(map(res => res.body || []));

    this.subscriptions$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.isLoading = false;
    });
  }

  loadUserPreferences(): void {
    this.accountService
      .identity(true)
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => this.applyUserPreferences(account?.timezone, account?.currency, account?.langKey));

    this.accountService
      .getAuthenticationState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => this.applyUserPreferences(account?.timezone, account?.currency, account?.langKey));
  }

  private applyUserPreferences(timezone?: string | null, currency?: string | null, langKey?: string | null): void {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.userTimezone = timezone ?? browserTimezone ?? 'UTC';
    this.userCurrency = currency ?? this.defaultCurrencyForTimezone(this.userTimezone);
    this.userLocale = this.resolveLocale(langKey);
  }

  private defaultCurrencyForTimezone(timezone: string): string {
    switch (timezone) {
      case 'Asia/Riyadh':
        return 'SAR';
      case 'Europe/Paris':
      case 'Europe/Berlin':
      case 'Europe/Amsterdam':
        return 'EUR';
      case 'Europe/London':
        return 'GBP';
      default:
        return 'USD';
    }
  }

  private resolveLocale(langKey?: string | null): string {
    if (!langKey) {
      return 'en-US';
    }

    switch (langKey.toLowerCase()) {
      case 'ar-ly':
      case 'ar':
        return 'ar-LY';
      case 'fr':
        return 'fr-FR';
      default:
        return 'en-US';
    }
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  openDeleteSubscriptionModal(content: TemplateRef<unknown>, subscription: ISaaSSubscription): void {
    this.subscriptionToDelete = subscription;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  confirmDeleteSubscription(modal: { close: () => void }): void {
    const id = this.subscriptionToDelete?.id;
    if (!id) {
      modal.close();
      return;
    }

    this.subscriptionService.delete(id).subscribe(() => {
      modal.close();
      this.subscriptionToDelete = null;
      this.loadData();
    });
  }

  openEditSubscriptionModal(content: TemplateRef<unknown>, subscription: ISaaSSubscription): void {
    if (!subscription.id) {
      return;
    }

    this.editingSubscriptionId = subscription.id;
    this.editingSubscription = subscription;
    this.subscriptionEditForm.patchValue({
      serviceName: subscription.serviceName,
      monthlyCost: subscription.monthlyCost,
      subscriptionDate: this.toDateInputValue(subscription.subscriptionDate),
      billingCycle: subscription.billingCycle,
      status: subscription.status,
      description: subscription.description ?? null,
      providerUrl: subscription.providerUrl ?? null,
      accountEmail: subscription.accountEmail ?? null,
      accountUsername: subscription.accountUsername ?? null,
      notes: subscription.notes ?? null,
      isShared: subscription.isShared ?? false,
    });

    this.modalService.open(content, { size: 'lg', centered: true, backdrop: 'static' });
  }

  saveSubscriptionEdits(modal: { close: () => void }): void {
    if (this.subscriptionEditForm.invalid || this.editingSubscriptionId === null || !this.editingSubscription) {
      this.subscriptionEditForm.markAllAsTouched();
      return;
    }

    const raw = this.subscriptionEditForm.getRawValue();
    const subscriptionDate = dayjs(raw.subscriptionDate);
    const renewalDate = this.calculateSubscriptionRenewalDate(subscriptionDate, raw.billingCycle);
    const payload: ISaaSSubscription = {
      ...this.editingSubscription,
      id: this.editingSubscriptionId,
      serviceName: raw.serviceName,
      monthlyCost: raw.monthlyCost,
      subscriptionDate,
      renewalDate,
      billingCycle: raw.billingCycle,
      status: raw.status,
      description: raw.description,
      providerUrl: raw.providerUrl,
      accountEmail: raw.accountEmail,
      accountUsername: raw.accountUsername,
      notes: raw.notes,
      isShared: raw.isShared,
    };

    this.subscriptionService.update(payload).subscribe(() => {
      this.editingSubscriptionId = null;
      this.editingSubscription = null;
      modal.close();
      this.loadData();
    });
  }

  openDeleteBillModal(content: TemplateRef<unknown>, bill: IBill): void {
    this.billToDelete = bill;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  confirmDeleteBill(modal: { close: () => void }): void {
    const id = this.billToDelete?.id;
    if (!id) {
      modal.close();
      return;
    }

    this.billService.delete(id).subscribe(() => {
      modal.close();
      this.billToDelete = null;
      this.loadData();
    });
  }

  openEditBillModal(content: TemplateRef<unknown>, bill: IBill): void {
    if (!bill.id) {
      return;
    }

    this.editingBillId = bill.id;
    this.editingBill = bill;
    this.billEditForm.patchValue({
      description: bill.description,
      amount: bill.amount,
      billDate: this.toDateInputValue(bill.billDate),
      dueDate: bill.dueDate ? this.toDateInputValue(bill.dueDate) : null,
      status: bill.status,
      paymentMethod: bill.paymentMethod,
      notes: bill.notes ?? null,
      isRecurring: bill.isRecurring ?? false,
    });

    this.modalService.open(content, { size: 'lg', centered: true, backdrop: 'static' });
  }

  saveBillEdits(modal: { close: () => void }): void {
    if (this.billEditForm.invalid || this.editingBillId === null || this.isSavingBill || !this.editingBill) {
      this.billEditForm.markAllAsTouched();
      return;
    }

    const raw = this.billEditForm.getRawValue();
    const payload: IBill = {
      ...this.editingBill,
      id: this.editingBillId,
      description: raw.description,
      amount: raw.amount,
      billDate: dayjs(raw.billDate),
      dueDate: raw.dueDate ? dayjs(raw.dueDate) : null,
      status: raw.status,
      paymentMethod: raw.paymentMethod,
      notes: raw.notes,
      isRecurring: raw.isRecurring,
    };

    this.isSavingBill = true;
    this.billService.update(payload).subscribe({
      next: () => {
        this.isSavingBill = false;
        this.editingBillId = null;
        this.editingBill = null;
        modal.close();
        this.loadData();
      },
      error: () => {
        this.isSavingBill = false;
      },
    });
  }

  private toDateInputValue(value: unknown): string {
    const date = this.toDate(value);
    return date ? dayjs(date).format('YYYY-MM-DD') : '';
  }

  private calculateSubscriptionRenewalDate(subscriptionDate: dayjs.Dayjs, billingCycle: BillingCycle): dayjs.Dayjs {
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

  openMarkPaidModal(content: TemplateRef<unknown>, bill: IBill): void {
    this.billToMarkPaid = bill;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  confirmMarkBillAsPaid(modal: { close: () => void }): void {
    const id = this.billToMarkPaid?.id;
    if (!id) {
      modal.close();
      return;
    }

    this.billService.markAsPaid(id).subscribe(() => {
      modal.close();
      this.billToMarkPaid = null;
      this.loadData();
    });
  }

  formatCurrency(value: number | undefined): string {
    const normalizedValue = value ?? 0;

    try {
      return new Intl.NumberFormat(this.userLocale, {
        style: 'currency',
        currency: this.userCurrency,
      }).format(normalizedValue);
    } catch {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(normalizedValue);
    }
  }

  formatDate(value: unknown): string {
    const date = this.toDate(value);
    if (!date) return '-';

    try {
      return new Intl.DateTimeFormat(this.userLocale, {
        timeZone: this.userTimezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    }
  }

   private toDate(value: unknown): Date | null {
     if (!value) return null;

     if (value instanceof Date) {
       return Number.isNaN(value.getTime()) ? null : value;
     }

     if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: unknown }).toDate === 'function') {
       const converted = (value as { toDate: () => Date }).toDate();
       return converted instanceof Date && !Number.isNaN(converted.getTime()) ? converted : null;
     }

     const parsed = new Date(value as string | number);
     return Number.isNaN(parsed.getTime()) ? null : parsed;
   }

  // Integration Methods
  pushBillToIntegration(bill: IBill, provider: string): void {
    if (!bill.id) {
      return;
    }

    if (provider === 'ticktick') {
      this.openTickTickProjectModalForBill(bill);
      return;
    }

    if (provider === 'microsoft-todo' || provider === 'todoist') {
      this.openComingSoonModal(provider);
      return;
    }

    const providerLabel = this.translateService.instant(this.getIntegrationProviderLabelKey(provider));
    const modalRef = this.modalService.open(ConfirmationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.title = this.translateService.instant('liferadarApp.evaluationDecision.integrations.confirmTitle', {
      provider: providerLabel,
    });
    modalRef.componentInstance.message = this.translateService.instant('liferadarApp.evaluationDecision.integrations.confirmMessage', {
      provider: providerLabel,
      actionItem: bill.description ?? '-',
    });
    modalRef.componentInstance.confirmButtonText = this.translateService.instant(
      'liferadarApp.evaluationDecision.integrations.confirmButton',
      {
        provider: providerLabel,
      },
    );
    modalRef.componentInstance.cancelButtonText = this.translateService.instant('entity.action.cancel');
    modalRef.componentInstance.confirmButtonClass = 'btn-primary';

    modalRef.closed
      .pipe(
        filter(reason => reason === 'confirmed'),
        tap(() => this.executeIntegrationPushForBill(bill, provider)),
      )
      .subscribe();
  }

  pushSubscriptionToIntegration(subscription: ISaaSSubscription, provider: string): void {
    if (!subscription.id) {
      return;
    }

    if (provider === 'ticktick') {
      this.openTickTickProjectModalForSubscription(subscription);
      return;
    }

    if (provider === 'microsoft-todo' || provider === 'todoist') {
      this.openComingSoonModal(provider);
      return;
    }

    const providerLabel = this.translateService.instant(this.getIntegrationProviderLabelKey(provider));
    const modalRef = this.modalService.open(ConfirmationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.title = this.translateService.instant('liferadarApp.evaluationDecision.integrations.confirmTitle', {
      provider: providerLabel,
    });
    modalRef.componentInstance.message = this.translateService.instant('liferadarApp.evaluationDecision.integrations.confirmMessage', {
      provider: providerLabel,
      actionItem: subscription.serviceName ?? '-',
    });
    modalRef.componentInstance.confirmButtonText = this.translateService.instant(
      'liferadarApp.evaluationDecision.integrations.confirmButton',
      {
        provider: providerLabel,
      },
    );
    modalRef.componentInstance.cancelButtonText = this.translateService.instant('entity.action.cancel');
    modalRef.componentInstance.confirmButtonClass = 'btn-primary';

    modalRef.closed
      .pipe(
        filter(reason => reason === 'confirmed'),
        tap(() => this.executeIntegrationPushForSubscription(subscription, provider)),
      )
      .subscribe();
  }

  private openComingSoonModal(provider: string): void {
    const providerLabel = this.translateService.instant(this.getIntegrationProviderLabelKey(provider));
    const modalRef = this.modalService.open(ConfirmationModalComponent, { size: 'md', backdrop: 'static' });
    modalRef.componentInstance.title = this.translateService.instant('liferadarApp.evaluationDecision.integrations.comingSoonTitle', {
      provider: providerLabel,
    });
    modalRef.componentInstance.message = this.translateService.instant('liferadarApp.evaluationDecision.integrations.comingSoonMessage');
    modalRef.componentInstance.confirmButtonText = this.translateService.instant('liferadarApp.evaluationDecision.integrations.comingSoonButton');
    modalRef.componentInstance.cancelButtonText = this.translateService.instant('entity.action.cancel');
    modalRef.componentInstance.confirmButtonClass = 'btn-primary';
  }

  private openTickTickProjectModalForBill(bill: IBill): void {
    if (!bill.id) {
      return;
    }

    const provider = 'ticktick';
    const key = `bill:${bill.id}:${provider}`;
    this.integrationPushingKeys.add(key);

    this.billService.getTickTickProjects().subscribe({
      next: res => {
        this.integrationPushingKeys.delete(key);
        const projectsResponse = res.body;
        const projects = projectsResponse?.projects ?? [];
        const defaultProjectName = (projectsResponse?.defaultProjectName ?? 'Liferadar').trim() || 'Liferadar';

        const modalRef = this.modalService.open(TickTickProjectModalComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.projects = projects;
        modalRef.componentInstance.initialTitle = (bill.description ?? '').trim();
        modalRef.componentInstance.defaultProjectName = defaultProjectName;

        modalRef.closed
          .pipe(
            filter((value): value is ITickTickProjectModalResult => typeof value === 'object' && value !== null && 'title' in value),
            tap(value =>
              this.executeIntegrationPushForBill(bill, provider, {
                projectId: value.projectId,
                title: value.title,
              }),
            ),
          )
          .subscribe();
      },
      error: () => {
        this.integrationPushingKeys.delete(key);
        // The global ErrorHandlerInterceptor broadcasts the HTTP error, which AlertErrorComponent handles.
      },
    });
  }

  private openTickTickProjectModalForSubscription(subscription: ISaaSSubscription): void {
    if (!subscription.id) {
      return;
    }

    const provider = 'ticktick';
    const key = `subscription:${subscription.id}:${provider}`;
    this.integrationPushingKeys.add(key);

    this.subscriptionService.getTickTickProjects().subscribe({
      next: res => {
        this.integrationPushingKeys.delete(key);
        const projectsResponse = res.body;
        const projects = projectsResponse?.projects ?? [];
        const defaultProjectName = (projectsResponse?.defaultProjectName ?? 'Liferadar').trim() || 'Liferadar';

        const modalRef = this.modalService.open(TickTickProjectModalComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.projects = projects;
        modalRef.componentInstance.initialTitle = (subscription.serviceName ?? '').trim();
        modalRef.componentInstance.defaultProjectName = defaultProjectName;

        modalRef.closed
          .pipe(
            filter((value): value is ITickTickProjectModalResult => typeof value === 'object' && value !== null && 'title' in value),
            tap(value =>
              this.executeIntegrationPushForSubscription(subscription, provider, {
                projectId: value.projectId,
                title: value.title,
              }),
            ),
          )
          .subscribe();
      },
      error: (error) => {
        this.integrationPushingKeys.delete(key);
        this.handleTickTickError(error);
      },
    });
  }

  private executeIntegrationPushForBill(bill: IBill, provider: string, overrides?: { projectId?: string; title?: string }): void {
    if (!bill.id) {
      return;
    }

    const key = `bill:${bill.id}:${provider}`;
    this.integrationPushingKeys.add(key);

    this.billService
      .pushToTodoApp({
        billId: bill.id,
        provider,
        projectId: overrides?.projectId,
        title: overrides?.title,
        dueAt: bill.dueDate?.toISOString(),
      })
      .subscribe({
        next: res => {
          this.integrationPushingKeys.delete(key);
          this.alertService.addAlert({
            type: 'success',
            message: res.body?.message ?? this.translateService.instant('liferadarApp.evaluationDecision.integrations.pushSuccess'),
          });
        },
        error: () => {
          this.integrationPushingKeys.delete(key);
          // The global ErrorHandlerInterceptor broadcasts the HTTP error, which AlertErrorComponent handles.
        },
      });
  }

  private executeIntegrationPushForSubscription(
    subscription: ISaaSSubscription,
    provider: string,
    overrides?: { projectId?: string; title?: string },
  ): void {
    if (!subscription.id) {
      return;
    }

    const key = `subscription:${subscription.id}:${provider}`;
    this.integrationPushingKeys.add(key);

    this.subscriptionService
      .pushToTodoApp({
        subscriptionId: subscription.id,
        provider,
        projectId: overrides?.projectId,
        title: overrides?.title,
        dueAt: subscription.renewalDate?.toISOString(),
      })
      .subscribe({
        next: res => {
          this.integrationPushingKeys.delete(key);
          this.alertService.addAlert({
            type: 'success',
            message: res.body?.message ?? this.translateService.instant('liferadarApp.evaluationDecision.integrations.pushSuccess'),
          });
        },
        error: () => {
          this.integrationPushingKeys.delete(key);
          // The global ErrorHandlerInterceptor broadcasts the HTTP error, which AlertErrorComponent handles.
        },
      });
  }

  private getIntegrationProviderLabelKey(provider: string): string {
    return this.integrationProviders.find(item => item.code === provider)?.labelKey ?? 'liferadarApp.evaluationDecision.integrations.title';
  }

  isIntegrationPushing(id: number, type: 'bill' | 'subscription', provider: string): boolean {
    const key = `${type}:${id}:${provider}`;
    return this.integrationPushingKeys.has(key);
  }

  isIntegrationDisabled(id: number, type: 'bill' | 'subscription'): boolean {
    return this.integrationPushingKeys.has(`${type}:${id}:ticktick`) ||
      this.integrationPushingKeys.has(`${type}:${id}:microsoft-todo`) ||
      this.integrationPushingKeys.has(`${type}:${id}:todoist`);
  }

  private handleTickTickError(error: any): void {
    const errorTitle = error?.error?.title;

    if (errorTitle && errorTitle.includes('TickTick is not connected')) {
      const router: Router = this.router;
      const modalRef = this.modalService.open(ConfirmationModalComponent, { size: 'md', backdrop: 'static' });
      modalRef.componentInstance.title = this.translateService.instant('billsSubscriptions.ticktickNotConnected');
      modalRef.componentInstance.message = this.translateService.instant('billsSubscriptions.ticktickNotConnectedMessage');
      modalRef.componentInstance.confirmButtonText = this.translateService.instant('billsSubscriptions.goToSettings');
      modalRef.componentInstance.cancelButtonText = this.translateService.instant('entity.action.cancel');
      modalRef.componentInstance.confirmButtonClass = 'btn-primary';

      modalRef.closed
        .pipe(filter((reason: unknown) => reason === 'confirmed'))
        .subscribe(() => void router.navigate(['/account/todoapps']));
    }
  }
}

