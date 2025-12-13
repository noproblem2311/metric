import { Timezone } from '../../../../src/domain/value-objects/Timezone';

describe('Timezone Value Object', () => {
  describe('Validation', () => {
    it('should create valid UTC timezone', () => {
      const timezone = new Timezone('UTC');
      expect(timezone.getValue()).toBe('UTC');
    });

    it('should create valid IANA timezone', () => {
      const timezone = new Timezone('America/New_York');
      expect(timezone.getValue()).toBe('America/New_York');
    });

    it('should create valid Asia/Tokyo timezone', () => {
      const timezone = new Timezone('Asia/Tokyo');
      expect(timezone.getValue()).toBe('Asia/Tokyo');
    });

    it('should create valid Europe/London timezone', () => {
      const timezone = new Timezone('Europe/London');
      expect(timezone.getValue()).toBe('Europe/London');
    });

    it('should throw error for invalid timezone format', () => {
      expect(() => {
        new Timezone('invalid-timezone');
      }).toThrow('Invalid IANA timezone format: invalid-timezone');
    });

    it('should throw error for empty timezone', () => {
      expect(() => {
        new Timezone('');
      }).toThrow('Invalid IANA timezone format: ');
    });
  });

  describe('parseToUTC', () => {
    it('should parse ISO date string to UTC timestamp', () => {
      const timezone = new Timezone('UTC');
      const timestamp = timezone.parseToUTC('2023-12-13T10:30:00.000Z');
      expect(timestamp).toBeGreaterThan(0);
      expect(typeof timestamp).toBe('number');
    });

    it('should parse custom format date string to UTC timestamp', () => {
      const timezone = new Timezone('UTC');
      const timestamp = timezone.parseToUTC('2023-12-13 10:30:00');
      expect(timestamp).toBeGreaterThan(0);
    });

    it('should parse date with timezone offset', () => {
      const timezone = new Timezone('America/New_York');
      const timestamp = timezone.parseToUTC('2023-12-13 10:30:00');
      expect(timestamp).toBeGreaterThan(0);
    });

    it('should throw error for invalid date string', () => {
      const timezone = new Timezone('UTC');
      expect(() => {
        timezone.parseToUTC('invalid-date');
      }).toThrow('Invalid date format: invalid-date');
    });
  });

  describe('formatFromUTC', () => {
    it('should format UTC timestamp to date string in UTC', () => {
      const timezone = new Timezone('UTC');
      const formatted = timezone.formatFromUTC(1702465800);
      expect(formatted).toMatch(/2023-12-13 \d{2}:\d{2}:\d{2}/);
    });

    it('should format UTC timestamp with custom format', () => {
      const timezone = new Timezone('UTC');
      const formatted = timezone.formatFromUTC(1702465800, 'yyyy-MM-dd');
      expect(formatted).toBe('2023-12-13');
    });

    it('should format UTC timestamp to timezone-specific date', () => {
      const timezone = new Timezone('America/New_York');
      const formatted = timezone.formatFromUTC(1702465800);
      expect(formatted).toMatch(/2023-12-13/);
    });

    it('should format UTC timestamp to Asia/Tokyo timezone', () => {
      const timezone = new Timezone('Asia/Tokyo');
      const formatted = timezone.formatFromUTC(1702465800);
      expect(formatted).toMatch(/2023-12-13/);
    });
  });

  describe('getDateString', () => {
    it('should return date string without time in UTC', () => {
      const timezone = new Timezone('UTC');
      const dateString = timezone.getDateString(1702465800);
      expect(dateString).toBe('2023-12-13');
    });

    it('should return date string without time in specific timezone', () => {
      const timezone = new Timezone('America/New_York');
      const dateString = timezone.getDateString(1702465800);
      expect(dateString).toMatch(/2023-12-13/);
    });
  });

  describe('equals', () => {
    it('should return true for equal timezones', () => {
      const timezone1 = new Timezone('UTC');
      const timezone2 = new Timezone('UTC');
      expect(timezone1.equals(timezone2)).toBe(true);
    });

    it('should return true for equal IANA timezones', () => {
      const timezone1 = new Timezone('America/New_York');
      const timezone2 = new Timezone('America/New_York');
      expect(timezone1.equals(timezone2)).toBe(true);
    });

    it('should return false for different timezones', () => {
      const timezone1 = new Timezone('UTC');
      const timezone2 = new Timezone('America/New_York');
      expect(timezone1.equals(timezone2)).toBe(false);
    });
  });

  describe('DST Handling', () => {
    it('should handle daylight saving time transitions', () => {
      const timezone = new Timezone('America/New_York');
      const summerTimestamp = timezone.parseToUTC('2023-07-15 12:00:00');
      const winterTimestamp = timezone.parseToUTC('2023-12-15 12:00:00');
      
      expect(summerTimestamp).not.toBe(winterTimestamp);
    });

    it('should correctly format dates during DST', () => {
      const timezone = new Timezone('Europe/London');
      const timestamp = 1689422400;
      const formatted = timezone.formatFromUTC(timestamp);
      expect(formatted).toMatch(/2023-07-15/);
    });
  });
});

