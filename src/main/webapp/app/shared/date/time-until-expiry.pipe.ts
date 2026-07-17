import { Pipe, PipeTransform } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs/esm';

@Pipe({
  name: 'timeUntilExpiry',
  standalone: true,
})
export default class TimeUntilExpiryPipe implements PipeTransform {
  transform(value: string | Date | Dayjs | null | undefined): string {
    if (!value) return '';

    const expiryDate = dayjs(value);
    const now = dayjs();

    if (expiryDate.isBefore(now)) {
      return 'EXPIRED';
    }

    const daysUntil = expiryDate.diff(now, 'day');
    if (daysUntil === 0) {
      return 'TODAY';
    } else if (daysUntil === 1) {
      return 'TOMORROW';
    } else if (daysUntil < 30) {
      return `${daysUntil} days`;
    } else if (daysUntil < 365) {
      const months = Math.floor(daysUntil / 30);
      return `${months} months`;
    } else {
      const years = Math.floor(daysUntil / 365);
      return `${years} years`;
    }
  }
}
