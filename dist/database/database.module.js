"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entities/user.entity");
const mural_item_entity_1 = require("../entities/mural-item.entity");
const community_post_entity_1 = require("../entities/community-post.entity");
const community_post_like_entity_1 = require("../entities/community-post-like.entity");
const community_post_comment_entity_1 = require("../entities/community-post-comment.entity");
const ministry_entity_1 = require("../entities/ministry.entity");
const ministry_member_entity_1 = require("../entities/ministry-member.entity");
const birthday_message_template_entity_1 = require("../entities/birthday-message-template.entity");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const useSocket = Boolean(config.get('DB_SOCKET_PATH'));
                    const configuredHost = config.get('DB_HOST') || '127.0.0.1';
                    const tcpHost = configuredHost.toLowerCase() === 'localhost'
                        ? '127.0.0.1'
                        : configuredHost;
                    return {
                        type: 'mysql',
                        host: useSocket ? undefined : tcpHost,
                        socketPath: useSocket ? config.get('DB_SOCKET_PATH') : undefined,
                        port: useSocket ? undefined : config.get('DB_PORT') || 3306,
                        username: config.get('DB_USER'),
                        password: config.get('DB_PASSWORD'),
                        database: config.get('DB_NAME'),
                        entities: [
                            user_entity_1.User,
                            mural_item_entity_1.MuralItem,
                            community_post_entity_1.CommunityPost,
                            community_post_like_entity_1.CommunityPostLike,
                            community_post_comment_entity_1.CommunityPostComment,
                            ministry_entity_1.Ministry,
                            ministry_member_entity_1.MinistryMember,
                            birthday_message_template_entity_1.BirthdayMessageTemplate
                        ],
                        synchronize: false,
                        extra: {
                            connectionLimit: config.get('DB_CONNECTION_LIMIT') || 10
                        },
                        timezone: 'Z'
                    };
                }
            })
        ]
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map