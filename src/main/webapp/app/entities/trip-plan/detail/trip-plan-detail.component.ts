import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { FormatMediumDatePipe } from 'app/shared/date';
import { ITripPlan } from '../trip-plan.model';

@Component({
  selector: 'jhi-trip-plan-detail',
  templateUrl: './trip-plan-detail.component.html',
  imports: [SharedModule, RouterModule, FormatMediumDatePipe],
})
export class TripPlanDetailComponent {
  tripPlan = input<ITripPlan | null>(null);

  previousState(): void {
    window.history.back();
  }
}
