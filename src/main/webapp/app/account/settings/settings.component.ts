import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import SharedModule from 'app/shared/shared.module';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
import { LoginService } from 'app/login/login.service';
import { LANGUAGES } from 'app/config/language.constants';
import { CURRENCIES, TIMEZONES } from 'app/shared/constants/preferences.constants';

const initialAccount: Account = {} as Account;

@Component({
  selector: 'jhi-settings',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
})
export default class SettingsComponent implements OnInit {
  success = signal(false);
  languages = LANGUAGES;
  timezones = TIMEZONES;
  currencies = CURRENCIES;
  canManageFamily = signal(false);
  managingFamily = signal(false);

  settingsForm = new FormGroup({
    firstName: new FormControl(initialAccount.firstName, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    lastName: new FormControl(initialAccount.lastName, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50)],
    }),
    email: new FormControl(initialAccount.email, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    langKey: new FormControl(initialAccount.langKey, { nonNullable: true }),
    timezone: new FormControl('UTC', { nonNullable: true }),
    currency: new FormControl('USD', { nonNullable: true }),

    activated: new FormControl(initialAccount.activated, { nonNullable: true }),
    authorities: new FormControl(initialAccount.authorities, { nonNullable: true }),
    imageUrl: new FormControl(initialAccount.imageUrl, { nonNullable: true }),
    login: new FormControl(initialAccount.login, { nonNullable: true }),
  });

  private readonly accountService = inject(AccountService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.accountService.identity().subscribe(account => {
      if (account) {
        this.settingsForm.patchValue({
          ...account,
          timezone: account.timezone ?? 'UTC',
          currency: account.currency ?? 'USD',
        });
        this.checkFamilyManagementStatus(account);
      }
    });
  }

  private checkFamilyManagementStatus(account: Account): void {
    const hasParentRole = account.authorities?.includes('ROLE_PARENT') ?? false;
    this.canManageFamily.set(hasParentRole);
  }

  save(): void {
    this.success.set(false);

    const account = this.settingsForm.getRawValue();
    this.accountService.save(account).subscribe(() => {
      this.success.set(true);

      this.accountService.authenticate(account);

      if (account.langKey !== this.translateService.currentLang) {
        this.translateService.use(account.langKey);
      }
    });
  }

  toggleFamilyManagement(): void {
    if (this.canManageFamily()) {
      // Disable family management
      this.managingFamily.set(true);
      this.http.post('/api/account/disable-family-management', {}).subscribe({
        next: () => {
          this.canManageFamily.set(false);
          this.managingFamily.set(false);
          this.success.set(true);
          this.refreshSessionAfterRoleChange();
        },
        error: () => {
          this.managingFamily.set(false);
        },
      });
    } else {
      // Enable family management
      this.managingFamily.set(true);
      this.http.post('/api/account/enable-family-management', {}).subscribe({
        next: () => {
          this.canManageFamily.set(true);
          this.managingFamily.set(false);
          this.success.set(true);
          this.refreshSessionAfterRoleChange();
        },
        error: () => {
          this.managingFamily.set(false);
        },
      });
    }
  }

  private refreshSessionAfterRoleChange(): void {
    // JWT authorities are embedded in the token; re-login is required after role changes.
    this.accountService.identity(true).subscribe(() => {
      this.loginService.logout();
      this.router.navigate(['/login']);
    });
  }
}
