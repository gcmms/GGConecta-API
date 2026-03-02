"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const env_validation_1 = require("./config/env.validation");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const mural_module_1 = require("./mural/mural.module");
const community_module_1 = require("./community/community.module");
const events_module_1 = require("./events/events.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const ministries_module_1 = require("./ministries/ministries.module");
const birthdays_module_1 = require("./birthdays/birthdays.module");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validationSchema: env_validation_1.envValidationSchema
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            mural_module_1.MuralModule,
            community_module_1.CommunityModule,
            events_module_1.EventsModule,
            dashboard_module_1.DashboardModule,
            ministries_module_1.MinistriesModule,
            birthdays_module_1.BirthdaysModule
        ],
        controllers: [app_controller_1.AppController]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map