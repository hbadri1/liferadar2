import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ISubLifePillarItemTranslation } from '../sub-life-pillar-item-translation.model';

@Component({
  selector: 'jhi-sub-life-pillar-item-translation-detail',
  templateUrl: './sub-life-pillar-item-translation-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class SubLifePillarItemTranslationDetailComponent {
  subLifePillarItemTranslation = input<ISubLifePillarItemTranslation | null>(null);

  previousState(): void {
    window.history.back();
  }
}
