import { Injectable } from '@angular/core';
import { SortState } from './sort-state';

@Injectable({ providedIn: 'root' })
export class SortService {
  private readonly collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
  });

  startSort({ predicate, order }: Required<SortState>, fallback?: Required<SortState>): (a: any, b: any) => number {
    const multiply = order === 'desc' ? -1 : 1;
    return (a: any, b: any) => {
      const compare = this.compareValues(this.resolveValue(a, predicate), this.resolveValue(b, predicate));
      if (compare === 0 && fallback) {
        return this.startSort(fallback)(a, b);
      }
      return compare * multiply;
    };
  }

  private resolveValue(entity: any, predicate: string): unknown {
    return predicate.split('.').reduce<unknown>((current, key) => {
      if (current === null || current === undefined) {
        return undefined;
      }
      return (current as Record<string, unknown>)[key];
    }, entity);
  }

  private compareValues(leftValue: unknown, rightValue: unknown): number {
    if (leftValue === rightValue) {
      return 0;
    }
    if (leftValue === null || leftValue === undefined) {
      return 1;
    }
    if (rightValue === null || rightValue === undefined) {
      return -1;
    }

    const normalizedLeft = this.normalizeValue(leftValue);
    const normalizedRight = this.normalizeValue(rightValue);

    if (typeof normalizedLeft === 'number' && typeof normalizedRight === 'number') {
      return normalizedLeft - normalizedRight;
    }

    return this.collator.compare(String(normalizedLeft), String(normalizedRight));
  }

  private normalizeValue(value: unknown): string | number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    if (value instanceof Date) {
      return value.valueOf();
    }
    if (typeof value === 'object' && value !== null && 'valueOf' in value && typeof (value as { valueOf: () => unknown }).valueOf === 'function') {
      const numericValue = (value as { valueOf: () => unknown }).valueOf();
      if (typeof numericValue === 'number' && Number.isFinite(numericValue)) {
        return numericValue;
      }
    }
    return String(value);
  }

  parseSortParam(sortParam: string | undefined): SortState {
    if (sortParam?.includes(',')) {
      const split = sortParam.split(',');
      if (split[0]) {
        return { predicate: split[0], order: split[1] as any };
      }
    }
    return { predicate: sortParam?.length ? sortParam : undefined };
  }

  buildSortParam({ predicate, order }: SortState, fallback?: string): string[] {
    const sortParam = predicate && order ? [`${predicate},${order}`] : [];
    if (fallback && predicate !== fallback) {
      sortParam.push(`${fallback},asc`);
    }
    return sortParam;
  }
}
