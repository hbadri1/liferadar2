import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IPillar } from '../pillar.model';

@Component({
  selector: 'jhi-pillar-detail',
  templateUrl: './pillar-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class PillarDetailComponent {
  pillar = input<IPillar | null>(null);

  previousState(): void {
    window.history.back();
  }
}
