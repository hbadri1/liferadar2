import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ISubLifePillarTranslation } from '../sub-life-pillar-translation.model';

@Component({
  selector: 'jhi-sub-life-pillar-translation-detail',
  templateUrl: './sub-life-pillar-translation-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class SubLifePillarTranslationDetailComponent {
  subLifePillarTranslation = input<ISubLifePillarTranslation | null>(null);

  previousState(): void {
    window.history.back();
  }
}
