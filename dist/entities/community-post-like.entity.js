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
exports.CommunityPostLike = void 0;
const typeorm_1 = require("typeorm");
const community_post_entity_1 = require("./community-post.entity");
const user_entity_1 = require("./user.entity");
let CommunityPostLike = class CommunityPostLike {
};
exports.CommunityPostLike = CommunityPostLike;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CommunityPostLike.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => community_post_entity_1.CommunityPost, (post) => post.likes, { onDelete: 'CASCADE' }),
    __metadata("design:type", community_post_entity_1.CommunityPost)
], CommunityPostLike.prototype, "post", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.likes, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], CommunityPostLike.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'post_id' }),
    __metadata("design:type", Number)
], CommunityPostLike.prototype, "postId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], CommunityPostLike.prototype, "userId", void 0);
exports.CommunityPostLike = CommunityPostLike = __decorate([
    (0, typeorm_1.Entity)({ name: 'community_post_likes' })
], CommunityPostLike);
//# sourceMappingURL=community-post-like.entity.js.map