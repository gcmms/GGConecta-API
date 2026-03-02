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
exports.CommunityPostComment = void 0;
const typeorm_1 = require("typeorm");
const community_post_entity_1 = require("./community-post.entity");
const user_entity_1 = require("./user.entity");
let CommunityPostComment = class CommunityPostComment {
};
exports.CommunityPostComment = CommunityPostComment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CommunityPostComment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => community_post_entity_1.CommunityPost, (post) => post.comments, {
        onDelete: 'CASCADE'
    }),
    __metadata("design:type", community_post_entity_1.CommunityPost)
], CommunityPostComment.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.comments, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], CommunityPostComment.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'post_id' }),
    __metadata("design:type", Number)
], CommunityPostComment.prototype, "postId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], CommunityPostComment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], CommunityPostComment.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CommunityPostComment.prototype, "createdAt", void 0);
exports.CommunityPostComment = CommunityPostComment = __decorate([
    (0, typeorm_1.Entity)({ name: 'community_post_comments' })
], CommunityPostComment);
//# sourceMappingURL=community-post-comment.entity.js.map