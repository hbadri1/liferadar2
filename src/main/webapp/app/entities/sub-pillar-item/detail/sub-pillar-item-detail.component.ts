import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ISubPillarItem } from '../sub-pillar-item.model';

@Component({
  selector: 'jhi-sub-pillar-item-detail',
  templateUrl: './sub-pillar-item-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class SubPillarItemDetailComponent {
  subPillarItem = input<ISubPillarItem | null>(null);

  previousState(): void {
    window.history.back();
  }
}
