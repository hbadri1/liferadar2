import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ISubLifePillar } from '../sub-life-pillar.model';

@Component({
  selector: 'jhi-sub-life-pillar-detail',
  templateUrl: './sub-life-pillar-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class SubLifePillarDetailComponent {
  subLifePillar = input<ISubLifePillar | null>(null);

  previousState(): void {
    window.history.back();
  }
}
