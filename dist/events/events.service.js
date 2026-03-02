"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ical = require("node-ical");
const sortByStartDate = (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
const isFutureOrOngoing = (startDate, endDate) => {
    if (!startDate)
        return false;
    const now = new Date();
    const end = endDate ? new Date(endDate) : new Date(startDate);
    const tolerance = 24 * 60 * 60 * 1000;
    return end.getTime() + tolerance >= now.getTime();
};
const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');
let EventsService = class EventsService {
    constructor(configService) {
        this.configService = configService;
    }
    async fetchEvents() {
        const calendarUrl = this.configService.get('GOOGLE_CALENDAR_ICAL_URL');
        if (!calendarUrl) {
            throw new Error('URL do calendário não configurada. Defina GOOGLE_CALENDAR_ICAL_URL.');
        }
        const icalData = await ical.async.fromURL(calendarUrl);
        const events = Object.values(icalData)
            .filter((item) => item.type === 'VEVENT')
            .map((event) => {
            var _a, _b;
            const startDate = event.start instanceof Date ? event.start : null;
            const endDate = event.end instanceof Date ? event.end : null;
            const start = (_a = startDate === null || startDate === void 0 ? void 0 : startDate.toISOString()) !== null && _a !== void 0 ? _a : null;
            const end = (_b = endDate === null || endDate === void 0 ? void 0 : endDate.toISOString()) !== null && _b !== void 0 ? _b : null;
            const isAllDay = Boolean(event.datetype === 'date' ||
                (startDate &&
                    endDate &&
                    startDate.getHours() === 0 &&
                    startDate.getMinutes() === 0 &&
                    endDate.getHours() === 0 &&
                    endDate.getMinutes() === 0 &&
                    endDate.getTime() - startDate.getTime() >= 23 * 60 * 60 * 1000));
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
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EventsService);
//# sourceMappingURL=events.service.js.map