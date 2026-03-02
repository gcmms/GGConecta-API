import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ical from 'node-ical';

const sortByStartDate = (a: any, b: any) =>
  new Date(a.start_date).getTime() - new Date(b.start_date).getTime();

const isFutureOrOngoing = (startDate: string | null, endDate: string | null) => {
  if (!startDate) return false;
  const now = new Date();
  const end = endDate ? new Date(endDate) : new Date(startDate);
  const tolerance = 24 * 60 * 60 * 1000;
  return end.getTime() + tolerance >= now.getTime();
};

const cleanText = (value: any) => (typeof value === 'string' ? value.trim() : '');

@Injectable()
export class EventsService {
  constructor(private readonly configService: ConfigService) {}

  async fetchEvents() {
    const calendarUrl = this.configService.get<string>('GOOGLE_CALENDAR_ICAL_URL');

    if (!calendarUrl) {
      throw new Error('URL do calendário não configurada. Defina GOOGLE_CALENDAR_ICAL_URL.');
    }

    const icalData = await ical.async.fromURL(calendarUrl);

    const events = Object.values(icalData)
      .filter((item: any) => item.type === 'VEVENT')
      .map((event: any) => {
        const startDate = event.start instanceof Date ? event.start : null;
        const endDate = event.end instanceof Date ? event.end : null;

        const start = startDate?.toISOString() ?? null;
        const end = endDate?.toISOString() ?? null;

        const isAllDay = Boolean(
          event.datetype === 'date' ||
            (startDate &&
              endDate &&
              startDate.getHours() === 0 &&
              startDate.getMinutes() === 0 &&
              endDate.getHours() === 0 &&
              endDate.getMinutes() === 0 &&
              endDate.getTime() - startDate.getTime() >= 23 * 60 * 60 * 1000)
        );

        return {
          id: cleanText(event.uid) || cleanText(event.summary) || start || String(Math.random()),
          title: cleanText(event.summary) || 'Evento sem título',
          description: cleanText(event.description),
          location: cleanText(event.location),
          start_date: start,
          end_date: end,
          all_day: isAllDay
        };
      })
      .filter((event) => event.start_date && isFutureOrOngoing(event.start_date, event.end_date))
      .sort(sortByStartDate);

    return events;
  }
}
