"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BirthdaysModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const birthday_message_template_entity_1 = require("../entities/birthday-message-template.entity");
const user_entity_1 = require("../entities/user.entity");
const birthday_templates_service_1 = require("./birthday-templates.service");
const birthdays_controller_1 = require("./birthdays.controller");
const birthdays_service_1 = require("./birthdays.service");
let BirthdaysModule = class BirthdaysModule {
};
exports.BirthdaysModule = BirthdaysModule;
exports.BirthdaysModule = BirthdaysModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, birthday_message_template_entity_1.BirthdayMessageTemplate])],
        controllers: [birthdays_controller_1.BirthdaysController],
        providers: [birthdays_service_1.BirthdaysService, birthday_templates_service_1.BirthdayTemplatesService]
    })
], BirthdaysModule);
//# sourceMappingURL=birthdays.module.js.map