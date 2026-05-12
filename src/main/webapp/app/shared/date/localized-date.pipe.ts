import { Pipe, PipeTransform, inject } from '@angular/core';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

import { toAngularLocale } from 'app/config/language-locale.util';

@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false,
})
export default class LocalizedDatePipe implements PipeTransform {
  private readonly translateService = inject(TranslateService);

  transform(value: string | number | Date | null | undefined, format = 'mediumDate', timezone?: string, locale?: string): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const activeLocale = locale ?? toAngularLocale(this.translateService.currentLang || this.translateService.defaultLang);
    return formatDate(value, format, activeLocale, timezone);
  }
}
