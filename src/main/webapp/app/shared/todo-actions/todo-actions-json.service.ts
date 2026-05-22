import { Injectable } from '@angular/core';
import { TripTodoActionItem, TripTodoActionsPayload, TripTodoActionsListName } from './todo-actions.types';

@Injectable({ providedIn: 'root' })
export class TodoActionsJsonService {
  readonly maxActionsPerList = 30;
  readonly maxActionTextLength = 50;

  parse(actionsJson?: string | null): TripTodoActionsPayload {
    if (!actionsJson) {
      return this.emptyPayload();
    }

    try {
      const parsed = JSON.parse(actionsJson) as Partial<TripTodoActionsPayload>;
      return {
        preparationActions: this.normalizeList(parsed.preparationActions),
        duringTripActions: this.normalizeList(parsed.duringTripActions),
      };
    } catch {
      return this.emptyPayload();
    }
  }

  serialize(payload: TripTodoActionsPayload): string | null {
    if (payload.preparationActions.length === 0 && payload.duringTripActions.length === 0) {
      return null;
    }

    return JSON.stringify(payload);
  }

  addAction(payload: TripTodoActionsPayload, listName: TripTodoActionsListName, actionText: string): TripTodoActionsPayload {
    return {
      ...payload,
      [listName]: [...payload[listName], { actionText, actionStatus: false }],
    };
  }

  toggleAction(
    payload: TripTodoActionsPayload,
    listName: TripTodoActionsListName,
    index: number,
    actionStatus: boolean,
  ): TripTodoActionsPayload {
    const nextList = payload[listName].map((item, itemIndex) => (itemIndex === index ? { ...item, actionStatus } : item));
    return {
      ...payload,
      [listName]: nextList,
    };
  }

  removeAction(payload: TripTodoActionsPayload, listName: TripTodoActionsListName, index: number): TripTodoActionsPayload {
    return {
      ...payload,
      [listName]: payload[listName].filter((_item, itemIndex) => itemIndex !== index),
    };
  }

  private emptyPayload(): TripTodoActionsPayload {
    return { preparationActions: [], duringTripActions: [] };
  }

  private normalizeList(list: unknown): TripTodoActionItem[] {
    if (!Array.isArray(list)) {
      return [];
    }

    return list
      .map((item): TripTodoActionItem | null => {
        if (!item || typeof item !== 'object') {
          return null;
        }

        const rec = item as { actionText?: unknown; actionStatus?: unknown; text?: unknown; done?: unknown };
        const textCandidate = typeof rec.actionText === 'string' ? rec.actionText : typeof rec.text === 'string' ? rec.text : null;

        if (!textCandidate) {
          return null;
        }

        const actionText = textCandidate.trim();
        if (!actionText) {
          return null;
        }

        const statusCandidate = typeof rec.actionStatus === 'boolean' ? rec.actionStatus : rec.done;
        return {
          actionText,
          actionStatus: statusCandidate === true,
        };
      })
      .filter((item): item is TripTodoActionItem => item !== null);
  }
}
