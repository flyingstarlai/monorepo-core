/**
 * Date formatting utilities for UTC+8 timezone
 * Ensures consistent date handling across the API without timezone conversion
 */

export const formatDateUTC8 = (date: Date): string => {
  // Format as ISO string but preserve UTC+8 timezone
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

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
