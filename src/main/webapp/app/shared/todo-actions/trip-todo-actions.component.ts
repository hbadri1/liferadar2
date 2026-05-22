import { Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';
import { TodoActionsJsonService } from './todo-actions-json.service';
import { TripTodoActionsListName, TripTodoActionsPayload } from './todo-actions.types';

@Component({
  selector: 'jhi-trip-todo-actions',
  templateUrl: './trip-todo-actions.component.html',
  styleUrl: './trip-todo-actions.component.scss',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
})
export class TripTodoActionsComponent implements OnChanges {
  @Input() actionsJson?: string | null;
  @Input() disabled = false;
  @Input() compact = false;

  @Output() actionsJsonChange = new EventEmitter<string | null>();
  @Output() validationError = new EventEmitter<string | null>();

  readonly jsonService = inject(TodoActionsJsonService);

  payload: TripTodoActionsPayload = { preparationActions: [], duringTripActions: [] };
  preparationInput = '';
  duringInput = '';
  pendingDelete: { listName: TripTodoActionsListName; index: number } | null = null;

  ngOnChanges(): void {
    this.payload = this.jsonService.parse(this.actionsJson);
  }

  addAction(listName: TripTodoActionsListName): void {
    if (this.disabled) {
      return;
    }

    const sourceText = listName === 'preparationActions' ? this.preparationInput : this.duringInput;
    const actionText = sourceText.trim();
    if (!actionText) {
      return;
    }

    if (actionText.length > this.jsonService.maxActionTextLength) {
      this.validationError.emit('trips.errors.tripActionTextTooLong');
      return;
    }

    if (this.payload[listName].length >= this.jsonService.maxActionsPerList) {
      this.validationError.emit('trips.errors.tripActionsListTooLarge');
      return;
    }

    this.payload = this.jsonService.addAction(this.payload, listName, actionText);
    this.validationError.emit(null);
    this.actionsJsonChange.emit(this.jsonService.serialize(this.payload));

    if (listName === 'preparationActions') {
      this.preparationInput = '';
    } else {
      this.duringInput = '';
    }
  }

  toggleAction(listName: TripTodoActionsListName, index: number, actionStatus: boolean): void {
    if (this.disabled) {
      return;
    }

    this.payload = this.jsonService.toggleAction(this.payload, listName, index, actionStatus);
    this.actionsJsonChange.emit(this.jsonService.serialize(this.payload));
  }

  removeAction(listName: TripTodoActionsListName, index: number): void {
    if (this.disabled) {
      return;
    }

    this.pendingDelete = { listName, index };
  }

  confirmRemove(): void {
    if (!this.pendingDelete) {
      return;
    }

    const { listName, index } = this.pendingDelete;
    this.pendingDelete = null;
    this.payload = this.jsonService.removeAction(this.payload, listName, index);
    this.actionsJsonChange.emit(this.jsonService.serialize(this.payload));
  }

  cancelRemove(): void {
    this.pendingDelete = null;
  }
}
