import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AccountService } from 'app/core/auth/account.service';
import SharedModule from 'app/shared/shared.module';
import { PremiumInterestService } from './premium-interest.service';
import { PremiumAnalyticsService } from './premium-analytics.service';
import { PremiumBadgeComponent } from './premium-badge.component';

export interface PlannedArea {
  icon: string;
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'jhi-premium',
  templateUrl: './premium.component.html',
  styleUrl: './premium.component.scss',
  imports: [SharedModule, RouterModule, FormsModule, PremiumBadgeComponent],
})
export default class PremiumComponent {
  readonly account = inject(AccountService).trackCurrentAccount();
  private readonly interestService = inject(PremiumInterestService);
  private readonly analytics = inject(PremiumAnalyticsService);

  // ─── Form model ──────────────────────────────────────────────────────────
  email = '';
  feedback = '';

  // ─── UI state ────────────────────────────────────────────────────────────
  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // ─── Planned Premium Areas ───────────────────────────────────────────────
  readonly plannedAreas: PlannedArea[] = [
    { icon: '🧠', titleKey: 'premium.areas.ai.title',        descKey: 'premium.areas.ai.desc' },
    { icon: '💰', titleKey: 'premium.areas.finance.title',   descKey: 'premium.areas.finance.desc' },
    { icon: '🔔', titleKey: 'premium.areas.reminders.title', descKey: 'premium.areas.reminders.desc' },
    { icon: '📊', titleKey: 'premium.areas.analytics.title', descKey: 'premium.areas.analytics.desc' },
    { icon: '📱', titleKey: 'premium.areas.mobile.title',    descKey: 'premium.areas.mobile.desc' },
  ];

  submitInterest(): void {
    if (!this.email || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    const source = this.account() ? 'web-authenticated' : 'web-public';

    this.analytics.trackPremiumEvent('early_access_form_submitted', { source });

    this.interestService
      .submit({ email: this.email, feedback: this.feedback || undefined, source })
      .subscribe({
        next: () => {
          this.submitted.set(true);
          this.submitting.set(false);
          this.analytics.trackPremiumEvent('early_access_success', { email: this.email });
        },
        error: () => {
          this.errorMessage.set('premium.earlyAccess.error');
          this.submitting.set(false);
          this.analytics.trackPremiumEvent('early_access_error', { email: this.email });
        },
      });
  }
}

