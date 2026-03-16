import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ISubPillarTranslation } from '../sub-pillar-translation.model';

@Component({
  selector: 'jhi-sub-pillar-translation-detail',
  templateUrl: './sub-pillar-translation-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class SubPillarTranslationDetailComponent {
  subPillarTranslation = input<ISubPillarTranslation | null>(null);

  previousState(): void {
    window.history.back();
  }
}
