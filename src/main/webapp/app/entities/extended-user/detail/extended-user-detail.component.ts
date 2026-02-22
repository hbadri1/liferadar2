import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IExtendedUser } from '../extended-user.model';

@Component({
  selector: 'jhi-extended-user-detail',
  templateUrl: './extended-user-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class ExtendedUserDetailComponent {
  extendedUser = input<IExtendedUser | null>(null);

  previousState(): void {
    window.history.back();
  }
}
