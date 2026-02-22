import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ILifePillar } from '../life-pillar.model';

@Component({
  selector: 'jhi-life-pillar-detail',
  templateUrl: './life-pillar-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class LifePillarDetailComponent {
  lifePillar = input<ILifePillar | null>(null);

  previousState(): void {
    window.history.back();
  }
}
