export interface TripTodoActionItem {
  actionText: string;
  actionStatus: boolean;
}

export interface TripTodoActionsPayload {
  preparationActions: TripTodoActionItem[];
  duringTripActions: TripTodoActionItem[];
}

export type TripTodoActionsListName = keyof TripTodoActionsPayload;

