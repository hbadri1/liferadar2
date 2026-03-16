import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ISubPillarItemTranslation } from '../sub-pillar-item-translation.model';

@Component({
  selector: 'jhi-sub-pillar-item-translation-detail',
  templateUrl: './sub-pillar-item-translation-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class SubPillarItemTranslationDetailComponent {
  subPillarItemTranslation = input<ISubPillarItemTranslation | null>(null);

  previousState(): void {
    window.history.back();
  }
}
