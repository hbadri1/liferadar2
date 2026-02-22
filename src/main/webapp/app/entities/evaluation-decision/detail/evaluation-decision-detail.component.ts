import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatetimePipe } from 'app/shared/date';
import { IEvaluationDecision } from '../evaluation-decision.model';

@Component({
  selector: 'jhi-evaluation-decision-detail',
  templateUrl: './evaluation-decision-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatetimePipe],
})
export class EvaluationDecisionDetailComponent {
  evaluationDecision = input<IEvaluationDecision | null>(null);

  previousState(): void {
    window.history.back();
  }
}
