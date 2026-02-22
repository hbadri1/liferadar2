import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ISubLifePillarItem } from '../sub-life-pillar-item.model';

@Component({
  selector: 'jhi-sub-life-pillar-item-detail',
  templateUrl: './sub-life-pillar-item-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class SubLifePillarItemDetailComponent {
  subLifePillarItem = input<ISubLifePillarItem | null>(null);

  previousState(): void {
    window.history.back();
  }
}
