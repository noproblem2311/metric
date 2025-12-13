import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';
import { parse, isValid } from 'date-fns';

export class Timezone {
  private readonly value: string;

  constructor(timezone: string) {
    if (!this.isValidIANA(timezone)) {
      throw new Error(`Invalid IANA timezone format: ${timezone}`);
    }
    this.value = timezone;
  }

  private isValidIANA(timezone: string): boolean {
    return /^[A-Za-z_]+\/[A-Za-z_]+$/.test(timezone) || timezone === 'UTC';
  }

  getValue(): string {
    return this.value;
  }

  parseToUTC(dateString: string): number {
    let parsedDate = new Date(dateString);
    
    if (!isValid(parsedDate)) {
      parsedDate = parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date());
    }
    
    if (!isValid(parsedDate)) {
      throw new Error(`Invalid date format: ${dateString}`);
    }
    
    try {
      const utcDate = zonedTimeToUtc(parsedDate, this.value);
      return Math.floor(utcDate.getTime() / 1000);
    } catch (error) {
      throw new Error(`Invalid IANA timezone: ${this.value}`);
    }
  }

  formatFromUTC(timestamp: number, formatString: string = 'yyyy-MM-dd HH:mm:ss'): string {
    const utcDate = new Date(timestamp * 1000);
    const zonedDate = utcToZonedTime(utcDate, this.value);
    return format(zonedDate, formatString, { timeZone: this.value });
  }

  getDateString(timestamp: number): string {
    return this.formatFromUTC(timestamp, 'yyyy-MM-dd');
  }

  equals(other: Timezone): boolean {
    return this.value === other.value;
  }
}
