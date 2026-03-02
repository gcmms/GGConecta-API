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
exports.MinistryMember = void 0;
const typeorm_1 = require("typeorm");
const ministry_entity_1 = require("./ministry.entity");
const user_entity_1 = require("./user.entity");
let MinistryMember = class MinistryMember {
};
exports.MinistryMember = MinistryMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ unsigned: true }),
    __metadata("design:type", Number)
], MinistryMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ministry_id', type: 'int', unsigned: true }),
    __metadata("design:type", Number)
], MinistryMember.prototype, "ministryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'int', unsigned: true }),
    __metadata("design:type", Number)
], MinistryMember.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ministry_entity_1.Ministry, (ministry) => ministry.memberships, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'ministry_id' }),
    __metadata("design:type", ministry_entity_1.Ministry)
], MinistryMember.prototype, "ministry", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.ministryMemberships, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], MinistryMember.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MinistryMember.prototype, "createdAt", void 0);
exports.MinistryMember = MinistryMember = __decorate([
    (0, typeorm_1.Entity)({ name: 'ministry_members' }),
    (0, typeorm_1.Unique)('uq_ministry_members', ['ministryId', 'userId'])
], MinistryMember);
//# sourceMappingURL=ministry-member.entity.js.map