/**
 * Date formatting utilities for UTC+8 timezone
 * Ensures consistent date handling across the API without timezone conversion
 */

export const formatDateUTC8 = (date: Date): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value || '';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hours = getPart('hour');
  const minutes = getPart('minute');
  const seconds = getPart('second');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
};

export const formatCurrentTimeUTC8 = (): string => {
  return formatDateUTC8(new Date());
};

/**
 * Parse a UTC+8 formatted date string back to Date object
 * Handles strings like: "2025-01-15T14:30:00+08:00"
 */
export const parseUTC8Date = (dateString: string): Date => {
  return new Date(dateString);
};
