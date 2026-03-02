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
exports.User = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
const community_post_entity_1 = require("./community-post.entity");
const community_post_like_entity_1 = require("./community-post-like.entity");
const community_post_comment_entity_1 = require("./community-post-comment.entity");
const ministry_entity_1 = require("./ministry.entity");
const ministry_member_entity_1 = require("./ministry-member.entity");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "Administrador";
    UserRole["MEMBER"] = "Membro";
    UserRole["NON_MEMBER"] = "N\u00E3o membro";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ unsigned: true }),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name' }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name' }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'birth_date', type: 'date' }),
    __metadata("design:type", String)
], User.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'secondary_phone', nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "secondaryPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'social_name', nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "socialName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gender', nullable: true, type: 'varchar', length: 30 }),
    __metadata("design:type", Object)
], User.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'marital_status', nullable: true, type: 'varchar', length: 50 }),
    __metadata("design:type", Object)
], User.prototype, "maritalStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cpf', nullable: true, type: 'varchar', length: 20 }),
    __metadata("design:type", Object)
], User.prototype, "cpf", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rg_number', nullable: true, type: 'varchar', length: 30 }),
    __metadata("design:type", Object)
], User.prototype, "rgNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rg_issuer', nullable: true, type: 'varchar', length: 100 }),
    __metadata("design:type", Object)
], User.prototype, "rgIssuer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rg_state', nullable: true, type: 'varchar', length: 10 }),
    __metadata("design:type", Object)
], User.prototype, "rgState", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'baptism_date', nullable: true, type: 'date' }),
    __metadata("design:type", Object)
], User.prototype, "baptismDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profession_faith_date', nullable: true, type: 'date' }),
    __metadata("design:type", Object)
], User.prototype, "professionFaithDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_contact_name', nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "emergencyContactName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emergency_contact_phone', nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "emergencyContactPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'person_type', type: 'varchar', length: 20, default: 'Membro' }),
    __metadata("design:type", String)
], User.prototype, "personType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'member_status', nullable: true, type: 'varchar', length: 40 }),
    __metadata("design:type", Object)
], User.prototype, "memberStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'church_entry_date', nullable: true, type: 'date' }),
    __metadata("design:type", Object)
], User.prototype, "churchEntryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'church_origin', nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "churchOrigin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'internal_notes', nullable: true, type: 'text' }),
    __metadata("design:type", Object)
], User.prototype, "internalNotes", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'role',
        type: 'varchar',
        length: 50,
        default: UserRole.MEMBER
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', select: false }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_street', nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "addressStreet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_number', nullable: true, type: 'varchar', length: 50 }),
    __metadata("design:type", Object)
], User.prototype, "addressNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_district', nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "addressDistrict", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_city', nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "addressCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_state', nullable: true, type: 'varchar', length: 100 }),
    __metadata("design:type", Object)
], User.prototype, "addressState", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_zip', nullable: true, type: 'varchar', length: 50 }),
    __metadata("design:type", Object)
], User.prototype, "addressZip", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_complement', nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", Object)
], User.prototype, "addressComplement", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => community_post_entity_1.CommunityPost, (post) => post.user),
    __metadata("design:type", Array)
], User.prototype, "posts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => community_post_like_entity_1.CommunityPostLike, (like) => like.user),
    __metadata("design:type", Array)
], User.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => community_post_comment_entity_1.CommunityPostComment, (comment) => comment.user),
    __metadata("design:type", Array)
], User.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ministry_entity_1.Ministry, (ministry) => ministry.leader),
    __metadata("design:type", Array)
], User.prototype, "ledMinistries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ministry_entity_1.Ministry, (ministry) => ministry.presbyter),
    __metadata("design:type", Array)
], User.prototype, "presbyterResponsibleMinistries", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ministry_member_entity_1.MinistryMember, (membership) => membership.user),
    __metadata("design:type", Array)
], User.prototype, "ministryMemberships", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)({ name: 'users' })
], User);
//# sourceMappingURL=user.entity.js.map