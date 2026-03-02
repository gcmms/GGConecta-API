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
exports.Ministry = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const ministry_member_entity_1 = require("./ministry-member.entity");
let Ministry = class Ministry {
};
exports.Ministry = Ministry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ unsigned: true }),
    __metadata("design:type", Number)
], Ministry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120 }),
    __metadata("design:type", String)
], Ministry.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 120, nullable: true }),
    __metadata("design:type", Object)
], Ministry.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Ministry.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Ministry.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leader_user_id', type: 'int', unsigned: true, nullable: true }),
    __metadata("design:type", Object)
], Ministry.prototype, "leaderUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'presbyter_user_id', type: 'int', unsigned: true, nullable: true }),
    __metadata("design:type", Object)
], Ministry.prototype, "presbyterUserId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.ledMinistries, {
        nullable: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'leader_user_id' }),
    __metadata("design:type", Object)
], Ministry.prototype, "leader", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.presbyterResponsibleMinistries, {
        nullable: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'presbyter_user_id' }),
    __metadata("design:type", Object)
], Ministry.prototype, "presbyter", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ministry_member_entity_1.MinistryMember, (membership) => membership.ministry),
    __metadata("design:type", Array)
], Ministry.prototype, "memberships", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Ministry.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Ministry.prototype, "updatedAt", void 0);
exports.Ministry = Ministry = __decorate([
    (0, typeorm_1.Entity)({ name: 'ministries' }),
    (0, typeorm_1.Unique)('uq_ministries_name', ['name'])
], Ministry);
//# sourceMappingURL=ministry.entity.js.map