import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ITripPlan } from '../trip-plan.model';
import { TripPlanService } from '../service/trip-plan.service';

@Component({
  templateUrl: './trip-plan-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class TripPlanDeleteDialogComponent {
  tripPlan?: ITripPlan;

  protected tripPlanService = inject(TripPlanService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.tripPlanService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
