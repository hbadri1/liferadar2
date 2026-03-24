import { SortService } from './sort.service';
import dayjs from 'dayjs/esm';

describe('sort state', () => {
  const service = new SortService();

  describe('parseSortParam', () => {
    it('should accept undefined value', () => {
      const sortState = service.parseSortParam(undefined);
      expect(sortState).toEqual({});
    });
    it('should accept empty string', () => {
      const sortState = service.parseSortParam('');
      expect(sortState).toEqual({});
    });
    it('should accept predicate only string', () => {
      const sortState = service.parseSortParam('predicate');
      expect(sortState).toEqual({ predicate: 'predicate' });
    });
    it('should accept predicate and ASC string', () => {
      const sortState = service.parseSortParam('predicate,asc');
      expect(sortState).toEqual({ predicate: 'predicate', order: 'asc' });
    });
    it('should accept predicate and DESC string', () => {
      const sortState = service.parseSortParam('predicate,desc');
      expect(sortState).toEqual({ predicate: 'predicate', order: 'desc' });
    });
  });
  describe('buildSortParam', () => {
    it('should accept empty object', () => {
      const sortParam = service.buildSortParam({});
      expect(sortParam).toEqual([]);
    });
    it('should accept object with predicate', () => {
      const sortParam = service.buildSortParam({ predicate: 'column' });
      expect(sortParam).toEqual([]);
    });
    it('should accept object with predicate and asc value', () => {
      const sortParam = service.buildSortParam({ predicate: 'column', order: 'asc' });
      expect(sortParam).toEqual(['column,asc']);
    });
    it('should accept object with predicate and desc value', () => {
      const sortParam = service.buildSortParam({ predicate: 'column', order: 'desc' });
      expect(sortParam).toEqual(['column,desc']);
    });
  });

  describe('startSort', () => {
    it('should sort dayjs dates in chronological order', () => {
      const values = [{ date: dayjs('2026-04-01T00:00:00') }, { date: dayjs('2026-03-25T00:00:00') }];

      values.sort(service.startSort({ predicate: 'date', order: 'asc' }));

      expect(values.map(value => value.date.format('YYYY-MM-DD'))).toEqual(['2026-03-25', '2026-04-01']);
    });

    it('should sort nested properties', () => {
      const values = [{ lifeEvaluation: { id: 10 } }, { lifeEvaluation: { id: 2 } }];

      values.sort(service.startSort({ predicate: 'lifeEvaluation.id', order: 'asc' }));

      expect(values.map(value => value.lifeEvaluation.id)).toEqual([2, 10]);
    });
  });
});
