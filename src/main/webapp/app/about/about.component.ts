import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AccountService } from 'app/core/auth/account.service';
import SharedModule from 'app/shared/shared.module';

@Component({
  selector: 'jhi-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  imports: [SharedModule, RouterModule],
})
export default class AboutComponent {
  readonly account = inject(AccountService).trackCurrentAccount();

  readonly features = [
    { icon: '🧭', key: 'pillars' },
    { icon: '📊', key: 'evaluations' },
    { icon: '✅', key: 'actionItems' },
    { icon: '💸', key: 'expenseControl' },
    { icon: '👨‍👩‍👧‍👦', key: 'family' },
    { icon: '✈️', key: 'trips' },
    { icon: '🌐', key: 'multilingual' },
  ];

  readonly steps = [
    { number: 1, key: 'define' },
    { number: 2, key: 'evaluate' },
    { number: 3, key: 'decide' },
    { number: 4, key: 'grow' },
  ];
}

