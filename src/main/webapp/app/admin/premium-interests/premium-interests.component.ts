import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';

import SharedModule from 'app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SortByDirective, SortDirective, SortService, sortStateSignal } from 'app/shared/sort';
import { PremiumInterestService, PremiumInterestResponse } from 'app/premium/premium-interest.service';

@Component({
  selector: 'jhi-premium-interests',
  templateUrl: './premium-interests.component.html',
  imports: [SharedModule, FormsModule, SortDirective, SortByDirective, DatePipe],
})
export default class PremiumInterestsComponent implements OnInit {
  entries = signal<PremiumInterestResponse[]>([]);
  isLoading = signal(false);
  filter = signal('');
  sortState = sortStateSignal({ predicate: 'createdDate', order: 'desc' });

  private readonly premiumInterestService = inject(PremiumInterestService);
  private readonly sortService = inject(SortService);

  filteredEntries = computed<PremiumInterestResponse[]>(() => {
    let data = this.entries();
    const f = this.filter().toLowerCase();
    if (f) {
      data = data.filter(e => e.email.toLowerCase().includes(f) || (e.feedback ?? '').toLowerCase().includes(f));
    }
    const { order, predicate } = this.sortState();
    if (order && predicate) {
      data = [...data].sort(this.sortService.startSort({ order, predicate }, { predicate: 'createdDate', order: 'desc' }));
    }
    return data;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.premiumInterestService.getAll().subscribe({
      next: data => {
        this.entries.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.entries.set([]);
        this.isLoading.set(false);
      },
    });
  }

  trackById(_: number, entry: PremiumInterestResponse): number {
    return entry.id;
  }
}
