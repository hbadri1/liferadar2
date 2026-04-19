import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';

import SharedModule from 'app/shared/shared.module';
import { ExtendedUserService } from 'app/entities/extended-user/service/extended-user.service';
import { IExtendedUser } from 'app/entities/extended-user/extended-user.model';
import { TIMEZONES, CURRENCIES } from 'app/shared/constants/preferences.constants';

@Component({
  selector: 'jhi-configuration-summary',
  templateUrl: './configuration-summary.component.html',
  styleUrl: './configuration-summary.component.scss',
  imports: [SharedModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export default class ConfigurationSummaryComponent implements OnInit {
  private readonly extendedUserService = inject(ExtendedUserService);

  configForm = new FormGroup({
    timezone: new FormControl('UTC', { nonNullable: true }),
    currency: new FormControl('USD', { nonNullable: true }),
  });

  timezones = TIMEZONES;
  currencies = CURRENCIES;
  extendedUser: IExtendedUser | null = null;
  isLoading = false;
  successMessage = false;

  ngOnInit(): void {
    this.loadConfiguration();
  }

  loadConfiguration(): void {
    this.isLoading = true;
    // Load extended user preferences from backend
    this.extendedUserService.findCurrentUser().subscribe({
      next: (user) => {
        this.extendedUser = user;
        this.configForm.patchValue({
          timezone: user.timezone || 'UTC',
          currency: user.currency || 'USD',
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  saveConfiguration(): void {
    if (!this.extendedUser) return;

    const updatedUser: IExtendedUser = {
      ...this.extendedUser,
      timezone: this.configForm.get('timezone')?.value,
      currency: this.configForm.get('currency')?.value,
    };

    this.extendedUserService.update(updatedUser).subscribe({
      next: () => {
        this.successMessage = true;
        setTimeout(() => (this.successMessage = false), 3000);
      },
      error: () => {
        // Error handling
      },
    });
  }

  getTimezoneName(value: string | null): string {
    const tz = this.timezones.find((t) => t.value === value);
    return tz ? tz.label : value || 'UTC';
  }

  getCurrencyName(value: string | null): string {
    const curr = this.currencies.find((c) => c.value === value);
    return curr ? curr.label : value || 'USD';
  }
}

