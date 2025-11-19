import {
  formatDateUTC8,
  formatCurrentTimeUTC8,
  parseUTC8Date,
} from './date-formatter';

describe('DateFormatter', () => {
  describe('formatDateUTC8', () => {
    it('should format date with UTC+8 timezone', () => {
      const date = new Date('2025-01-15T14:30:00');
      const result = formatDateUTC8(date);

      expect(result).toBe('2025-01-15T14:30:00+08:00');
    });

    it('should handle single digit months and days', () => {
      const date = new Date('2025-01-05T09:05:03');
      const result = formatDateUTC8(date);

      expect(result).toBe('2025-01-05T09:05:03+08:00');
    });
  });

  describe('formatCurrentTimeUTC8', () => {
    it('should return current time in UTC+8 format', () => {
      const result = formatCurrentTimeUTC8();

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+08:00$/);
    });
  });

  describe('parseUTC8Date', () => {
    it('should parse UTC+8 date string back to Date object', () => {
      const dateString = '2025-01-15T14:30:00+08:00';
      const result = parseUTC8Date(dateString);

      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(15);
    });
  });
});
