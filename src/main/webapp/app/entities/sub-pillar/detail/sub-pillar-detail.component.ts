import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ISubPillar } from '../sub-pillar.model';

@Component({
  selector: 'jhi-sub-pillar-detail',
  templateUrl: './sub-pillar-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class SubPillarDetailComponent {
  subPillar = input<ISubPillar | null>(null);

  previousState(): void {
    window.history.back();
  }
}
