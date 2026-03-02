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
exports.CommunityPost = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const community_post_like_entity_1 = require("./community-post-like.entity");
const community_post_comment_entity_1 = require("./community-post-comment.entity");
let CommunityPost = class CommunityPost {
};
exports.CommunityPost = CommunityPost;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CommunityPost.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.posts, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], CommunityPost.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], CommunityPost.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CommunityPost.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CommunityPost.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => community_post_like_entity_1.CommunityPostLike, (like) => like.post),
    __metadata("design:type", Array)
], CommunityPost.prototype, "likes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => community_post_comment_entity_1.CommunityPostComment, (comment) => comment.post),
    __metadata("design:type", Array)
], CommunityPost.prototype, "comments", void 0);
exports.CommunityPost = CommunityPost = __decorate([
    (0, typeorm_1.Entity)({ name: 'community_posts' })
], CommunityPost);
//# sourceMappingURL=community-post.entity.js.map