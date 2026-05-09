import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';
import { TripTodoActionsComponent } from './trip-todo-actions.component';

@NgModule({
  imports: [SharedModule, FormsModule],
  declarations: [TripTodoActionsComponent],
  exports: [TripTodoActionsComponent],
})
export class TodoActionsModule {}

