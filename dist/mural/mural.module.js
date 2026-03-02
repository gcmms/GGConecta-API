"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MuralModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const mural_item_entity_1 = require("../entities/mural-item.entity");
const mural_controller_1 = require("./mural.controller");
const mural_service_1 = require("./mural.service");
let MuralModule = class MuralModule {
};
exports.MuralModule = MuralModule;
exports.MuralModule = MuralModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([mural_item_entity_1.MuralItem])],
        controllers: [mural_controller_1.MuralController],
        providers: [mural_service_1.MuralService]
    })
], MuralModule);
//# sourceMappingURL=mural.module.js.map