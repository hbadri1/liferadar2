type TimezoneOption = { value: string; label: string };

const TIMEZONE_IDS = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'Asia/Riyadh',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
];

const normalizeGmtOffset = (rawOffset: string): string => {
  if (rawOffset === 'GMT' || rawOffset === 'UTC') {
    return 'GMT+00:00';
  }

  const normalizedRaw = rawOffset.startsWith('UTC') ? rawOffset.replace('UTC', 'GMT') : rawOffset;
  const match = normalizedRaw.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) {
    return 'GMT+00:00';
  }

  const [, sign, hour, minute] = match;
  const paddedHour = hour.padStart(2, '0');
  const normalizedMinute = minute ?? '00';
  return `GMT${sign}${paddedHour}:${normalizedMinute}`;
};

const getGmtOffset = (timeZone: string): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'shortOffset',
    });
    const offsetPart = formatter.formatToParts(new Date()).find(part => part.type === 'timeZoneName')?.value;
    return normalizeGmtOffset(offsetPart ?? 'GMT+00:00');
  } catch {
    return 'GMT+00:00';
  }
};

export const TIMEZONES: TimezoneOption[] = TIMEZONE_IDS.map(value => ({
  value,
  label: `${getGmtOffset(value)} - ${value}`,
}));

// Common currencies
export const CURRENCIES = [
  { value: 'USD', label: 'USD ($) - US Dollar' },
  { value: 'EUR', label: 'EUR (€) - Euro' },
  { value: 'GBP', label: 'GBP (£) - British Pound' },
  { value: 'JPY', label: 'JPY (¥) - Japanese Yen' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CAD', label: 'CAD ($) - Canadian Dollar' },
  { value: 'AUD', label: 'AUD ($) - Australian Dollar' },
  { value: 'NZD', label: 'NZD ($) - New Zealand Dollar' },
  { value: 'CNY', label: 'CNY (¥) - Chinese Yuan' },
  { value: 'HKD', label: 'HKD ($) - Hong Kong Dollar' },
  { value: 'SGD', label: 'SGD ($) - Singapore Dollar' },
  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
  { value: 'MXN', label: 'MXN ($) - Mexican Peso' },
  { value: 'BRL', label: 'BRL (R$) - Brazilian Real' },
  { value: 'ZAR', label: 'ZAR (R) - South African Rand' },
  { value: 'AED', label: 'AED (د.إ) - UAE Dirham' },
  { value: 'SAR', label: 'SAR (﷼) - Saudi Riyal' },
  { value: 'SEK', label: 'SEK (kr) - Swedish Krona' },
  { value: 'NOK', label: 'NOK (kr) - Norwegian Krone' },
  { value: 'DKK', label: 'DKK (kr) - Danish Krone' },
];

