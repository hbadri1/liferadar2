import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { ITripPlanStep } from '../trip-plan-step.model';

@Component({
  selector: 'jhi-trip-plan-step-detail',
  templateUrl: './trip-plan-step-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class TripPlanStepDetailComponent {
  tripPlanStep = input<ITripPlanStep | null>(null);

  previousState(): void {
    window.history.back();
  }
}
