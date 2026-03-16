import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IPillarTranslation } from '../pillar-translation.model';

@Component({
  selector: 'jhi-pillar-translation-detail',
  templateUrl: './pillar-translation-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class PillarTranslationDetailComponent {
  pillarTranslation = input<IPillarTranslation | null>(null);

  previousState(): void {
    window.history.back();
  }
}
