import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AccountService } from 'app/core/auth/account.service';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'jhi-premium',
  templateUrl: './premium.component.html',
  styleUrl: './premium.component.scss',
  imports: [SharedModule, RouterModule],
})
export default class PremiumComponent {
  readonly account = inject(AccountService).trackCurrentAccount();

  readonly planFeatureIndexes = [1, 2, 3, 4];

  readonly plans = [
    { key: 'starter', featured: false },
    { key: 'focus', featured: true },
    { key: 'family', featured: false },
    { key: 'coach', featured: false },
  ];
}

