"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_1 = require("@nestjs/swagger");
const sharedSchemas = {
    ErrorResponse: {
        type: 'object',
        properties: {
            message: {
                type: 'string',
                example: 'Mensagem de erro detalhando o problema.'
            }
        }
    },
    User: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            first_name: { type: 'string', example: 'Ana' },
            last_name: { type: 'string', example: 'Silva' },
            email: { type: 'string', format: 'email', example: 'ana@exemplo.com' },
            phone: { type: 'string', nullable: true, example: '+55 11 90000-0000' },
            birth_date: { type: 'string', format: 'date', example: '1990-05-10' },
            role: { type: 'string', example: 'Membro' },
            address: {
                type: 'object',
                nullable: true,
                properties: {
                    street: { type: 'string', example: 'Rua Exemplo' },
                    number: { type: 'string', example: '123' },
                    district: { type: 'string', example: 'Centro' },
                    city: { type: 'string', example: 'São Paulo' },
                    state: { type: 'string', example: 'SP' },
                    zip: { type: 'string', example: '01000-000' },
                    complement: { type: 'string', example: 'Apto 12' }
                }
            }
        }
    },
    RegisterInput: {
        type: 'object',
        required: ['first_name', 'last_name', 'birth_date', 'email', 'password'],
        properties: {
            first_name: { type: 'string', example: 'Ana' },
            last_name: { type: 'string', example: 'Silva' },
            birth_date: { type: 'string', format: 'date', example: '1990-05-10' },
            email: { type: 'string', format: 'email', example: 'ana@exemplo.com' },
            phone: { type: 'string', nullable: true, example: '+55 11 90000-0000' },
            password: { type: 'string', format: 'password', example: 'senhaForte123' },
            role: { type: 'string', example: 'Membro' },
            address: {
                type: 'object',
                nullable: true,
                properties: {
                    street: { type: 'string' },
                    number: { type: 'string' },
                    district: { type: 'string' },
                    city: { type: 'string' },
                    state: { type: 'string' },
                    zip: { type: 'string' },
                    complement: { type: 'string' }
                }
            }
        }
    },
    RegisterResponse: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Usuário criado com sucesso!' },
            user: { $ref: '#/components/schemas/User' }
        }
    },
    LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email', example: 'ana@exemplo.com' },
            password: { type: 'string', format: 'password', example: 'senhaForte123' }
        }
    },
    LoginResponse: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Login realizado com sucesso!' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            user: { $ref: '#/components/schemas/User' }
        }
    },
    CurrentUserResponse: {
        type: 'object',
        properties: {
            user: { $ref: '#/components/schemas/User' }
        }
    },
    MuralItem: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 10 },
            title: { type: 'string', example: 'Comunicado importante' },
            subtitle: { type: 'string', example: 'Detalhes do comunicado' },
            publish_date: { type: 'string', format: 'date', example: '2024-02-01' },
            link: { type: 'string', nullable: true, example: 'https://ipigg.org.br' },
            created_at: { type: 'string', format: 'date-time', example: '2024-01-10T12:22:00Z' },
            updated_at: { type: 'string', format: 'date-time', example: '2024-01-11T09:15:00Z' }
        }
    },
    CreateMuralInput: {
        type: 'object',
        required: ['title', 'subtitle', 'publish_date'],
        properties: {
            title: { type: 'string', example: 'Evento de networking' },
            subtitle: { type: 'string', example: 'Participe do evento presencial' },
            publish_date: { type: 'string', format: 'date', example: '2024-05-12' },
            link: { type: 'string', nullable: true, example: 'https://ipigg.org.br/evento' }
        }
    },
    MuralCreateResponse: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Aviso criado com sucesso!' },
            item: { $ref: '#/components/schemas/MuralItem' }
        }
    },
    DeleteMessageResponse: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Operação concluída.' }
        }
    },
    CommunityPost: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 42 },
            user_id: { type: 'integer', example: 5 },
            content: { type: 'string', example: 'Olá comunidade!' },
            author_name: { type: 'string', example: 'Ana Silva' },
            created_at: { type: 'string', format: 'date-time', example: '2024-03-01T12:00:00Z' },
            updated_at: { type: 'string', format: 'date-time', example: '2024-03-01T12:00:00Z' },
            likes_count: { type: 'integer', example: 10 },
            comments_count: { type: 'integer', example: 2 },
            liked_by_user: {
                type: 'integer',
                description: '1 quando o usuário informado curtiu o post, 0 caso contrário.',
                example: 0
            }
        }
    },
    CreateCommunityPostInput: {
        type: 'object',
        required: ['user_id', 'content'],
        properties: {
            user_id: { type: 'integer', example: 5 },
            content: { type: 'string', example: 'Nova conquista da minha empresa...' }
        }
    },
    CommunityPostResponse: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Publicação criada com sucesso!' },
            post: { $ref: '#/components/schemas/CommunityPost' }
        }
    },
    LikeCommunityPostInput: {
        type: 'object',
        required: ['user_id'],
        properties: {
            user_id: { type: 'integer', example: 5 }
        }
    },
    CommunityLikeResponse: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Publicação curtida com sucesso.' },
            liked: { type: 'boolean', example: true },
            likes_count: { type: 'integer', example: 11 }
        }
    },
    CommentCommunityPostInput: {
        type: 'object',
        required: ['user_id', 'comment'],
        properties: {
            user_id: { type: 'integer', example: 5 },
            comment: { type: 'string', example: 'Parabéns pelo resultado!' }
        }
    },
    CommunityComment: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 7 },
            post_id: { type: 'integer', example: 42 },
            comment: { type: 'string', example: 'Comentário no post' },
            created_at: { type: 'string', format: 'date-time', example: '2024-03-01T12:05:00Z' },
            author_name: { type: 'string', example: 'João Pereira' }
        }
    },
    CommunityCommentsResponse: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Comentário enviado!' },
            comments: {
                type: 'array',
                items: { $ref: '#/components/schemas/CommunityComment' }
            },
            comments_count: { type: 'integer', example: 3 }
        }
    },
    CommunityCommentListResponse: {
        type: 'array',
        items: { $ref: '#/components/schemas/CommunityComment' }
    },
    CalendarEvent: {
        type: 'object',
        properties: {
            id: { type: 'string', example: 'uid-123' },
            title: { type: 'string', example: 'Culto de Domingo' },
            description: { type: 'string', example: 'Celebração com louvor e palavra.' },
            location: { type: 'string', example: 'Rua Exemplo, 1000 - Auditório' },
            start_date: { type: 'string', format: 'date-time', example: '2024-08-01T19:00:00.000Z' },
            end_date: { type: 'string', format: 'date-time', example: '2024-08-01T20:30:00.000Z' },
            all_day: { type: 'boolean', example: false }
        }
    }
};
const setupSwagger = (app, configService) => {
    const apiBaseUrl = configService.get('API_BASE_URL');
    const builder = new swagger_1.DocumentBuilder()
        .setTitle('IPIGGConecta API')
        .setDescription('Documentação oficial da API IPIGGConecta, incluindo autenticação, mural e feed da comunidade.')
        .setVersion('1.0.0')
        .addBearerAuth({ type: 'http', bearerFormat: 'JWT' }, 'bearerAuth')
        .addServer(apiBaseUrl || 'http://localhost:3000');
    const config = builder.build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        deepScanRoutes: true
    });
    document.tags = [
        { name: 'Health', description: 'Verificação de status da API' },
        { name: 'Auth', description: 'Fluxos de autenticação de usuários' },
        { name: 'Mural', description: 'Gestão de avisos do mural' },
        { name: 'Community', description: 'Feed, curtidas e comentários da comunidade' },
        { name: 'Events', description: 'Eventos do calendário público (Google Calendar iCal)' }
    ];
    document.components = document.components || {};
    document.components.schemas = Object.assign(Object.assign({}, (document.components.schemas || {})), sharedSchemas);
    swagger_1.SwaggerModule.setup('docs', app, document, { explorer: true });
    app
        .getHttpAdapter()
        .getInstance()
        .get('/docs.json', (_req, res) => res.json(document));
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.config.js.map