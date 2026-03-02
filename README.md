# IPIGGConecta API (NestJS)

Nova versão NestJS modular que preserva contratos da API Express existente:

- Mesmos endpoints, payloads e mensagens de erro.
- Autenticação JWT com roles dinâmicos (Administrador, Membro e futuras).
- Módulos: Auth, Users, Mural, Community, Events.
- Documentação Swagger em `/docs` e `/docs.json`.

## Rodando localmente
```bash
cd api-nest
npm install
npm run start:dev
```

Crie um `.env` (use `.env.example` como base) apontando para o mesmo MySQL.

**Atualização de schema (Prisma)**  
- Gere o client Prisma e rode a migração automática que adiciona as colunas de endereço em `users`:
```bash
npm run migrate:address
```
- Para adicionar os novos campos completos de cadastro de pessoa (CPF, RG, sexo, estado civil, status de membro, etc.):
```bash
npm run migrate:user-profile-fields
```
- O script verifica colunas faltantes e só aplica as que não existem.
- Para recriar o banco inteiro do zero (dropa tabelas e recria o schema esperado), use:
```bash
npm run db:recreate
```

## Scripts
- `npm run start:dev` — hot reload.
- `npm run build` — compila para `dist/`.
- `npm run start` — executa build produzido.
- `npm run lint` — ESLint.

## Docker
```bash
docker build -t ipiggconecta-api-nest .
docker run --env-file .env -p 3000:3000 ipiggconecta-api-nest
```
