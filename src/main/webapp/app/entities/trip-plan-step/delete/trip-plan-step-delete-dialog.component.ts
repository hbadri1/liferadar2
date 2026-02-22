import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { ITripPlanStep } from '../trip-plan-step.model';
import { TripPlanStepService } from '../service/trip-plan-step.service';

@Component({
  templateUrl: './trip-plan-step-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class TripPlanStepDeleteDialogComponent {
  tripPlanStep?: ITripPlanStep;

  protected tripPlanStepService = inject(TripPlanStepService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.tripPlanStepService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
