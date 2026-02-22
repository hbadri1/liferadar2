import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { ILifePillarTranslation } from '../life-pillar-translation.model';

@Component({
  selector: 'jhi-life-pillar-translation-detail',
  templateUrl: './life-pillar-translation-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class LifePillarTranslationDetailComponent {
  lifePillarTranslation = input<ILifePillarTranslation | null>(null);

  previousState(): void {
    window.history.back();
  }
}
