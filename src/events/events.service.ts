import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import * as ical from 'node-ical';
import { In, Repository } from 'typeorm';
import { EventMinistryAssignment } from '../entities/event-ministry-assignment.entity';
import { EventMinistrySchedule } from '../entities/event-ministry-schedule.entity';
import { InternalEvent } from '../entities/internal-event.entity';
import { MinistryScheduleTemplate } from '../entities/ministry-schedule-template.entity';
import { Ministry } from '../entities/ministry.entity';
import { User } from '../entities/user.entity';
import { CreateInternalEventDto } from './dto/create-internal-event.dto';
import { CreateEventScheduleDto } from './dto/create-event-schedule.dto';
import { SaveMinistryTemplateDto } from './dto/save-ministry-template.dto';
import { UpdateEventAssignmentDto } from './dto/update-event-assignment.dto';
import { UpdateInternalEventDto } from './dto/update-internal-event.dto';

type EventListItem = {
  id: string;
  internal_id: number | null;
  title: string;
  description: string;
  location: string;
  start_date: string | null;
  end_date: string | null;
  all_day: boolean;
  source: 'ICAL' | 'INTERNAL';
};

type EventScheduleAssignmentItem = {
  id: number;
  slot_name: string;
  slot_order: number;
  person_id: number | null;
  person_name: string | null;
  status: string;
};

type EventScheduleItem = {
  id: number;
  event_key: string;
  ministry_id: number;
  ministry_name: string;
  assignments: EventScheduleAssignmentItem[];
};

type ScheduledEventOverviewItem = {
  event_key: string;
  event_title: string;
  event_start_date: string | null;
  event_location: string;
  event_source: 'ICAL' | 'INTERNAL';
  ministries_count: number;
  filled_slots: number;
  total_slots: number;
  status: 'Rascunho' | 'Publicado';
  ministries: {
    ministry_id: number;
    ministry_name: string;
    filled_slots: number;
    total_slots: number;
    status: 'Rascunho' | 'Publicado';
  }[];
};

const sortByStartDate = (a: EventListItem, b: EventListItem) =>
  new Date(a.start_date || '').getTime() - new Date(b.start_date || '').getTime();

const isFutureOrOngoing = (startDate: string | null, endDate: string | null) => {
  if (!startDate) return false;
  const now = new Date();
  const end = endDate ? new Date(endDate) : new Date(startDate);
  const tolerance = 24 * 60 * 60 * 1000;
  return end.getTime() + tolerance >= now.getTime();
};

const cleanText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const toIsoDate = (value: unknown) => (value instanceof Date ? value.toISOString() : null);

const buildStableId = (event: any, start: string | null, end: string | null) => {
  const uid = cleanText(event.uid);
  const recurrenceId = toIsoDate(event.recurrenceid);

  if (uid && recurrenceId) return `${uid}__${recurrenceId}`;
  if (uid && start) return `${uid}__${start}`;
  if (uid) return uid;

  const fingerprint = [
    cleanText(event.summary),
    cleanText(event.location),
    start || '',
    end || ''
  ].join('|');
  const hash = createHash('sha1').update(fingerprint).digest('hex').slice(0, 24);
  return `ical_${hash}`;
};

@Injectable()
export class EventsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(InternalEvent)
    private readonly internalEventsRepository: Repository<InternalEvent>,
    @InjectRepository(MinistryScheduleTemplate)
    private readonly templatesRepository: Repository<MinistryScheduleTemplate>,
    @InjectRepository(EventMinistrySchedule)
    private readonly schedulesRepository: Repository<EventMinistrySchedule>,
    @InjectRepository(EventMinistryAssignment)
    private readonly assignmentsRepository: Repository<EventMinistryAssignment>,
    @InjectRepository(Ministry)
    private readonly ministriesRepository: Repository<Ministry>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async fetchEvents(): Promise<EventListItem[]> {
    const [internalEvents, icalEvents] = await Promise.all([
      this.fetchInternalEvents(),
      this.fetchIcalEvents()
    ]);

    return [...internalEvents, ...icalEvents].sort(sortByStartDate);
  }

  async createInternalEvent(data: CreateInternalEventDto) {
    const title = cleanText(data.title);
    const description = cleanText(data.description);
    const location = cleanText(data.location);
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);

    if (!title) throw new Error('O título do evento é obrigatório.');
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new Error('As datas do evento são inválidas.');
    }
    if (endDate.getTime() < startDate.getTime()) {
      throw new Error('A data de término deve ser maior ou igual à data de início.');
    }

    const created = await this.internalEventsRepository.save(
      this.internalEventsRepository.create({
        title,
        description: description || null,
        location: location || null,
        startDate,
        endDate,
        allDay: Boolean(data.all_day)
      })
    );

    return this.mapInternalEvent(created);
  }

  async updateInternalEvent(id: number, data: UpdateInternalEventDto) {
    const event = await this.internalEventsRepository.findOne({ where: { id } });
    if (!event) throw new Error('Evento interno não encontrado.');

    if (data.title !== undefined) {
      const title = cleanText(data.title);
      if (!title) throw new Error('O título do evento é obrigatório.');
      event.title = title;
    }

    if (data.description !== undefined) event.description = cleanText(data.description) || null;
    if (data.location !== undefined) event.location = cleanText(data.location) || null;

    if (data.start_date !== undefined) {
      const startDate = new Date(data.start_date);
      if (Number.isNaN(startDate.getTime())) throw new Error('A data de início é inválida.');
      event.startDate = startDate;
    }

    if (data.end_date !== undefined) {
      const endDate = new Date(data.end_date);
      if (Number.isNaN(endDate.getTime())) throw new Error('A data de término é inválida.');
      event.endDate = endDate;
    }

    if (event.endDate.getTime() < event.startDate.getTime()) {
      throw new Error('A data de término deve ser maior ou igual à data de início.');
    }

    if (data.all_day !== undefined) event.allDay = Boolean(data.all_day);

    const saved = await this.internalEventsRepository.save(event);
    return this.mapInternalEvent(saved);
  }

  async deleteInternalEvent(id: number) {
    const event = await this.internalEventsRepository.findOne({ where: { id } });
    if (!event) throw new Error('Evento interno não encontrado.');
    await this.internalEventsRepository.remove(event);
    return { id };
  }

  async listMinistryTemplates(ministryId: number) {
    await this.assertMinistryExists(ministryId);
    const templates = await this.templatesRepository.find({
      where: { ministryId, isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' }
    });

    return {
      ministry_id: ministryId,
      slots: templates.map((template) => ({
        id: template.id,
        slot_name: template.slotName,
        quantity: template.quantity
      }))
    };
  }

  async saveMinistryTemplates(ministryId: number, data: SaveMinistryTemplateDto) {
    await this.assertMinistryExists(ministryId);

    const normalized = data.slots.map((slot, index) => ({
      slotName: cleanText(slot.slot_name),
      quantity: Number(slot.quantity) || 1,
      sortOrder: index + 1
    }));

    if (normalized.some((slot) => !slot.slotName)) {
      throw new Error('Todas as vagas precisam de nome.');
    }

    await this.templatesRepository.delete({ ministryId });
    const created = await this.templatesRepository.save(
      normalized.map((slot) =>
        this.templatesRepository.create({
          ministryId,
          slotName: slot.slotName,
          quantity: slot.quantity,
          sortOrder: slot.sortOrder,
          isActive: true
        })
      )
    );

    return {
      ministry_id: ministryId,
      slots: created.map((slot) => ({
        id: slot.id,
        slot_name: slot.slotName,
        quantity: slot.quantity
      }))
    };
  }

  async createEventSchedule(eventKey: string, data: CreateEventScheduleDto) {
    const normalizedEventKey = cleanText(eventKey);
    if (!normalizedEventKey) {
      throw new Error('Evento inválido para criação de escala.');
    }

    const ministry = await this.assertMinistryExists(data.ministry_id);

    const existing = await this.schedulesRepository.findOne({
      where: { eventKey: normalizedEventKey, ministryId: data.ministry_id }
    });
    if (existing) {
      throw new Error('Já existe escala deste ministério para este evento.');
    }

    const event = await this.findEventById(normalizedEventKey);
    if (!event) {
      throw new Error('Evento não encontrado para criar escala.');
    }

    const templates = await this.templatesRepository.find({
      where: { ministryId: data.ministry_id, isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' }
    });
    if (templates.length === 0) {
      throw new Error(
        'Este ministério não possui vagas padrão configuradas. Configure antes de criar a escala.'
      );
    }

    const schedule = await this.schedulesRepository.save(
      this.schedulesRepository.create({
        eventKey: normalizedEventKey,
        eventSource: event.source,
        eventTitle: event.title,
        eventStartDate: event.start_date ? new Date(event.start_date) : null,
        ministryId: data.ministry_id
      })
    );

    const assignmentsToCreate: EventMinistryAssignment[] = [];
    for (const template of templates) {
      const quantity = Number(template.quantity) > 0 ? Number(template.quantity) : 1;
      for (let index = 1; index <= quantity; index += 1) {
        assignmentsToCreate.push(
          this.assignmentsRepository.create({
            scheduleId: schedule.id,
            slotName: template.slotName,
            slotOrder: index,
            personId: null,
            status: 'Pendente'
          })
        );
      }
    }
    await this.assignmentsRepository.save(assignmentsToCreate);

    return {
      message: 'Escala criada com sucesso.',
      schedule: {
        id: schedule.id,
        event_key: schedule.eventKey,
        ministry_id: ministry.id,
        ministry_name: ministry.name
      }
    };
  }

  async listEventSchedules(eventKey: string): Promise<EventScheduleItem[]> {
    const normalizedEventKey = cleanText(eventKey);
    const schedules = await this.schedulesRepository.find({
      where: { eventKey: normalizedEventKey },
      order: { createdAt: 'ASC', id: 'ASC' }
    });
    if (schedules.length === 0) return [];

    const ministryIds = Array.from(new Set(schedules.map((schedule) => schedule.ministryId)));
    const scheduleIds = schedules.map((schedule) => schedule.id);
    const [ministries, assignments] = await Promise.all([
      this.ministriesRepository.find({ where: { id: In(ministryIds) } }),
      this.assignmentsRepository.find({
        where: { scheduleId: In(scheduleIds) },
        order: { scheduleId: 'ASC', slotName: 'ASC', slotOrder: 'ASC', id: 'ASC' }
      })
    ]);

    const personIds = Array.from(
      new Set(assignments.map((assignment) => assignment.personId).filter((id) => Boolean(id)))
    ) as number[];
    const users =
      personIds.length > 0
        ? await this.usersRepository.find({ where: { id: In(personIds) } })
        : [];

    const ministryById = new Map(ministries.map((ministry) => [ministry.id, ministry]));
    const userById = new Map(users.map((user) => [user.id, user]));
    const assignmentsBySchedule = new Map<number, EventMinistryAssignment[]>();

    assignments.forEach((assignment) => {
      if (!assignmentsBySchedule.has(assignment.scheduleId)) {
        assignmentsBySchedule.set(assignment.scheduleId, []);
      }
      assignmentsBySchedule.get(assignment.scheduleId)?.push(assignment);
    });

    return schedules.map((schedule) => ({
      id: schedule.id,
      event_key: schedule.eventKey,
      ministry_id: schedule.ministryId,
      ministry_name: ministryById.get(schedule.ministryId)?.name || `Ministério ${schedule.ministryId}`,
      assignments: (assignmentsBySchedule.get(schedule.id) || []).map((assignment) => {
        const user = assignment.personId ? userById.get(assignment.personId) : null;
        return {
          id: assignment.id,
          slot_name: assignment.slotName,
          slot_order: assignment.slotOrder,
          person_id: assignment.personId || null,
          person_name: user ? `${user.firstName} ${user.lastName}`.trim() : null,
          status: assignment.status || 'Pendente'
        };
      })
    }));
  }

  async listScheduledEventsOverview(): Promise<ScheduledEventOverviewItem[]> {
    const schedules = await this.schedulesRepository.find({
      order: { eventStartDate: 'DESC', createdAt: 'DESC', id: 'DESC' }
    });

    if (schedules.length === 0) return [];

    const eventMap = new Map<string, EventMinistrySchedule[]>();
    schedules.forEach((schedule) => {
      if (!eventMap.has(schedule.eventKey)) {
        eventMap.set(schedule.eventKey, []);
      }
      eventMap.get(schedule.eventKey)?.push(schedule);
    });

    const scheduleIds = schedules.map((schedule) => schedule.id);
    const ministryIds = Array.from(new Set(schedules.map((schedule) => schedule.ministryId)));
    const assignments =
      scheduleIds.length > 0
        ? await this.assignmentsRepository.find({
            where: { scheduleId: In(scheduleIds) }
          })
        : [];
    const ministries =
      ministryIds.length > 0
        ? await this.ministriesRepository.find({ where: { id: In(ministryIds) } })
        : [];

    const assignmentsBySchedule = new Map<number, EventMinistryAssignment[]>();
    assignments.forEach((assignment) => {
      if (!assignmentsBySchedule.has(assignment.scheduleId)) {
        assignmentsBySchedule.set(assignment.scheduleId, []);
      }
      assignmentsBySchedule.get(assignment.scheduleId)?.push(assignment);
    });

    const events = await this.fetchEvents();
    const eventDetailsById = new Map(events.map((event) => [event.id, event]));
    const ministryById = new Map(ministries.map((ministry) => [ministry.id, ministry]));

    const rows: ScheduledEventOverviewItem[] = [];
    eventMap.forEach((eventSchedules, eventKey) => {
      const first = eventSchedules[0];
      const details = eventDetailsById.get(eventKey);

      let totalSlots = 0;
      let filledSlots = 0;
      const ministries = eventSchedules.map((schedule) => {
        const list = assignmentsBySchedule.get(schedule.id) || [];
        const ministryTotalSlots = list.length;
        const ministryFilledSlots = list.filter((item) => Boolean(item.personId)).length;
        totalSlots += ministryTotalSlots;
        filledSlots += ministryFilledSlots;
        return {
          ministry_id: schedule.ministryId,
          ministry_name:
            ministryById.get(schedule.ministryId)?.name || `Ministério ${schedule.ministryId}`,
          filled_slots: ministryFilledSlots,
          total_slots: ministryTotalSlots,
          status:
            ministryTotalSlots > 0 && ministryFilledSlots === ministryTotalSlots
              ? ('Publicado' as const)
              : ('Rascunho' as const)
        };
      });

      rows.push({
        event_key: eventKey,
        event_title: details?.title || first.eventTitle,
        event_start_date: details?.start_date || first.eventStartDate?.toISOString?.() || null,
        event_location: details?.location || '',
        event_source: (details?.source || first.eventSource || 'INTERNAL') as 'ICAL' | 'INTERNAL',
        ministries_count: eventSchedules.length,
        filled_slots: filledSlots,
        total_slots: totalSlots,
        status: totalSlots > 0 && filledSlots === totalSlots ? 'Publicado' : 'Rascunho',
        ministries
      });
    });

    return rows.sort((a, b) => {
      const timeA = new Date(a.event_start_date || '').getTime();
      const timeB = new Date(b.event_start_date || '').getTime();
      return timeB - timeA;
    });
  }

  async updateAssignment(id: number, data: UpdateEventAssignmentDto) {
    const assignment = await this.assignmentsRepository.findOne({ where: { id } });
    if (!assignment) throw new Error('Vaga de escala não encontrada.');

    if (data.person_id === null || data.person_id === undefined) {
      assignment.personId = null;
      assignment.status = 'Pendente';
    } else {
      const person = await this.usersRepository.findOne({ where: { id: data.person_id } });
      if (!person) throw new Error('Pessoa informada não foi encontrada.');
      assignment.personId = person.id;
      assignment.status = 'Pendente';
    }

    const saved = await this.assignmentsRepository.save(assignment);
    const person = saved.personId
      ? await this.usersRepository.findOne({ where: { id: saved.personId } })
      : null;

    return {
      id: saved.id,
      slot_name: saved.slotName,
      slot_order: saved.slotOrder,
      person_id: saved.personId || null,
      person_name: person ? `${person.firstName} ${person.lastName}`.trim() : null,
      status: saved.status
    };
  }

  private async assertMinistryExists(ministryId: number) {
    const ministry = await this.ministriesRepository.findOne({ where: { id: ministryId } });
    if (!ministry) throw new Error('Ministério não encontrado.');
    return ministry;
  }

  private async findEventById(eventId: string): Promise<EventListItem | null> {
    const events = await this.fetchEvents();
    return events.find((event) => event.id === eventId) || null;
  }

  private async fetchInternalEvents(): Promise<EventListItem[]> {
    const events = await this.internalEventsRepository
      .createQueryBuilder('event')
      .orderBy('event.start_date', 'ASC')
      .getMany();

    return events.map((event) => this.mapInternalEvent(event));
  }

  private mapInternalEvent(event: InternalEvent): EventListItem {
    return {
      id: `internal:${event.id}`,
      internal_id: event.id,
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      start_date: event.startDate?.toISOString?.() || null,
      end_date: event.endDate?.toISOString?.() || null,
      all_day: Boolean(event.allDay),
      source: 'INTERNAL'
    };
  }

  private async fetchIcalEvents(): Promise<EventListItem[]> {
    const calendarUrl = this.configService.get<string>('GOOGLE_CALENDAR_ICAL_URL');
    if (!calendarUrl) return [];

    let icalData: any;
    try {
      icalData = await ical.async.fromURL(calendarUrl);
    } catch {
      return [];
    }

    const events = Object.values(icalData)
      .filter((item: any) => item.type === 'VEVENT')
      .map((event: any): EventListItem => {
        const startDate = event.start instanceof Date ? event.start : null;
        const endDate = event.end instanceof Date ? event.end : null;
        const start = toIsoDate(startDate);
        const end = toIsoDate(endDate);

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
          id: buildStableId(event, start, end),
          internal_id: null,
          title: cleanText(event.summary) || 'Evento sem título',
          description: cleanText(event.description),
          location: cleanText(event.location),
          start_date: start,
          end_date: end,
          all_day: isAllDay,
          source: 'ICAL'
        };
      })
      .filter((event) => event.start_date && isFutureOrOngoing(event.start_date, event.end_date))
      .sort(sortByStartDate);

    return events;
  }
}
