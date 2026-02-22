import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { ILifeEvaluation } from '../life-evaluation.model';

@Component({
  selector: 'jhi-life-evaluation-detail',
  templateUrl: './life-evaluation-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class LifeEvaluationDetailComponent {
  lifeEvaluation = input<ILifeEvaluation | null>(null);

  previousState(): void {
    window.history.back();
  }
}
