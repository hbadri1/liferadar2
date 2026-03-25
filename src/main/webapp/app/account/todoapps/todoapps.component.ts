import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { AlertService } from 'app/core/util/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { ITodoAppConfigUpdate, ITodoAppUserConfig } from './todoapps.model';
import { TodoAppsService } from './todoapps.service';

type TodoAppFormGroup = FormGroup<{
  enabled: FormControl<boolean>;
  accessToken: FormControl<string>;
  externalUserId: FormControl<string>;
  defaultProjectId: FormControl<string>;
  defaultProjectName: FormControl<string>;
}>;

@Component({
  selector: 'jhi-todoapps-settings',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
  templateUrl: './todoapps.component.html',
})
export default class TodoAppsComponent implements OnInit, OnDestroy {
  readonly account = signal<Account | null>(null);
  readonly todoAppConfigs = signal<ITodoAppUserConfig[]>([]);
  readonly isLoading = signal(false);
  readonly savingProviders = signal<Set<string>>(new Set());
  readonly providerForms = signal<Record<string, TodoAppFormGroup>>({});

  readonly providerOrder = ['ticktick', 'microsoft-todo', 'todoist'];

  readonly orderedConfigs = computed(() => {
    const configs = this.todoAppConfigs();
    return [...configs].sort((a, b) => this.providerOrder.indexOf(a.provider) - this.providerOrder.indexOf(b.provider));
  });

  private readonly accountService = inject(AccountService);
  private readonly todoAppsService = inject(TodoAppsService);
  private readonly alertService = inject(AlertService);
  private readonly translateService = inject(TranslateService);
  private readonly tickTickOAuthMessageHandler = (event: MessageEvent): void => {
    if (event.origin !== window.location.origin || event.data?.type !== 'ticktick-oauth') {
      return;
    }

    if (event.data?.status === 'success') {
      this.alertService.addAlert({ type: 'success', translationKey: 'todoapps.messages.ticktickAuthorized' });
      this.loadConfigs();
    } else {
      this.alertService.addAlert({ type: 'danger', message: event.data?.message || this.translateService.instant('todoapps.messages.ticktickAuthorizeFailed') });
    }
  };

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => this.account.set(account));
    window.addEventListener('message', this.tickTickOAuthMessageHandler);
    this.loadConfigs();
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.tickTickOAuthMessageHandler);
  }

  loadConfigs(): void {
    this.isLoading.set(true);
    this.todoAppsService.query().subscribe({
      next: response => {
        const configs = response.body ?? [];
        this.todoAppConfigs.set(configs);
        this.providerForms.set(this.buildForms(configs));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.alertService.addAlert({ type: 'danger', translationKey: 'todoapps.messages.loadError' });
      },
    });
  }

  save(provider: string): void {
    const form = this.providerForms()[provider];
    const config = this.todoAppConfigs().find(item => item.provider === provider);
    if (!form || !config) {
      return;
    }

    this.syncValidators(form, config);
    form.markAllAsTouched();
    form.updateValueAndValidity();
    if (form.invalid) {
      return;
    }

    this.setSaving(provider, true);
    const payload: ITodoAppConfigUpdate = {
      enabled: form.controls.enabled.getRawValue(),
      accessToken: form.controls.accessToken.getRawValue().trim() || null,
      externalUserId: form.controls.externalUserId.getRawValue().trim() || null,
      defaultProjectId: form.controls.defaultProjectId.getRawValue().trim() || null,
      defaultProjectName: form.controls.defaultProjectName.getRawValue().trim() || null,
    };

    this.todoAppsService.update(provider, payload).subscribe({
      next: response => {
        const updated = response.body;
        if (updated) {
          this.todoAppConfigs.set(this.todoAppConfigs().map(item => (item.provider === provider ? updated : item)));
          this.providerForms.update(forms => ({ ...forms, [provider]: this.createForm(updated) }));
        }
        this.setSaving(provider, false);
        this.alertService.addAlert({
          type: 'success',
          message: this.translateService.instant(
            config.configured ? 'todoapps.messages.updateSuccess' : 'todoapps.messages.createSuccess',
            { provider: this.getProviderLabel(provider) },
          ),
        });
      },
      error: error => {
        this.setSaving(provider, false);
        this.alertService.addAlert({
          type: 'danger',
          message: error?.error?.message || this.translateService.instant('todoapps.messages.saveError'),
        });
      },
    });
  }

  authorizeTickTick(): void {
    this.todoAppsService.getTickTickAuthorizeUrl().subscribe({
      next: response => {
        const authorizeUrl = response.body?.authorizeUrl;
        if (!authorizeUrl) {
          this.alertService.addAlert({ type: 'danger', translationKey: 'todoapps.messages.ticktickAuthorizeFailed' });
          return;
        }

        const popup = window.open(authorizeUrl, 'ticktick-oauth', 'popup=yes,width=640,height=760');
        if (!popup) {
          this.alertService.addAlert({ type: 'warning', translationKey: 'todoapps.messages.popupBlocked' });
        }
      },
      error: error => {
        this.alertService.addAlert({
          type: 'danger',
          message: error?.error?.message || this.translateService.instant('todoapps.messages.ticktickAuthorizeFailed'),
        });
      },
    });
  }

  disconnectTickTick(): void {
    this.todoAppsService.disconnectTickTick().subscribe({
      next: response => {
        this.alertService.addAlert({
          type: 'success',
          message: response.body?.message || this.translateService.instant('todoapps.messages.ticktickDisconnected'),
        });
        this.loadConfigs();
      },
      error: error => {
        this.alertService.addAlert({
          type: 'danger',
          message: error?.error?.message || this.translateService.instant('todoapps.messages.ticktickDisconnectFailed'),
        });
      },
    });
  }

  isTickTickConnected(config: ITodoAppUserConfig): boolean {
    return config.provider === 'ticktick' && config.hasAccessToken;
  }

  isSaving(provider: string): boolean {
    return this.savingProviders().has(provider);
  }

  getForm(provider: string): TodoAppFormGroup | undefined {
    return this.providerForms()[provider];
  }

  getProviderLabel(provider: string): string {
    return this.translateService.instant(`todoapps.providers.${provider}`);
  }

  getProjectIdLabel(config: ITodoAppUserConfig): string {
    return this.translateService.instant(
      config.requiresDefaultProjectId ? 'todoapps.form.microsoftListId' : 'todoapps.form.defaultProjectId',
    );
  }

  isTickTickProvider(provider: string): boolean {
    return provider === 'ticktick';
  }

  showManualCredentialFields(config: ITodoAppUserConfig): boolean {
    return !this.isTickTickProvider(config.provider);
  }

  showDefaultProjectIdField(config: ITodoAppUserConfig): boolean {
    return !this.isTickTickProvider(config.provider);
  }

  showDefaultProjectNameField(config: ITodoAppUserConfig): boolean {
    return this.isTickTickProvider(config.provider);
  }

  private buildForms(configs: ITodoAppUserConfig[]): Record<string, TodoAppFormGroup> {
    return configs.reduce<Record<string, TodoAppFormGroup>>((acc, config) => {
      acc[config.provider] = this.createForm(config);
      return acc;
    }, {});
  }

  private createForm(config: ITodoAppUserConfig): TodoAppFormGroup {
    const form = new FormGroup({
      enabled: new FormControl(config.enabled, { nonNullable: true }),
      accessToken: new FormControl('', { nonNullable: true }),
      externalUserId: new FormControl(config.externalUserId ?? '', { nonNullable: true }),
      defaultProjectId: new FormControl(config.defaultProjectId ?? '', { nonNullable: true }),
      defaultProjectName: new FormControl(config.defaultProjectName ?? '', { nonNullable: true }),
    });

    this.syncValidators(form, config);
    form.controls.enabled.valueChanges.subscribe(() => this.syncValidators(form, config));
    return form;
  }

  private syncValidators(form: TodoAppFormGroup, config: ITodoAppUserConfig): void {
    const isEnabled = form.controls.enabled.getRawValue();

    form.controls.accessToken.setValidators(isEnabled && !this.isTickTickProvider(config.provider) ? [Validators.required] : []);
    form.controls.accessToken.updateValueAndValidity({ emitEvent: false });

    form.controls.defaultProjectId.setValidators(isEnabled && config.requiresDefaultProjectId ? [Validators.required] : []);
    form.controls.defaultProjectId.updateValueAndValidity({ emitEvent: false });
  }

  private setSaving(provider: string, saving: boolean): void {
    this.savingProviders.update(current => {
      const next = new Set(current);
      if (saving) {
        next.add(provider);
      } else {
        next.delete(provider);
      }
      return next;
    });
  }
}

