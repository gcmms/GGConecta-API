import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const columns = [{ name: 'session_version', definition: 'INT NOT NULL DEFAULT 1' }];

async function main() {
  const existingColumns = await prisma.$queryRaw<Array<{ COLUMN_NAME: string }>>`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
  `;

  const existingSet = new Set(existingColumns.map((c) => c.COLUMN_NAME));
  const missing = columns.filter((col) => !existingSet.has(col.name));

  if (missing.length === 0) {
    console.log('Nenhuma coluna pendente. Tabela users já possui session_version.');
    return;
  }

  for (const col of missing) {
    const sql = `ALTER TABLE users ADD COLUMN ${col.name} ${col.definition}`;
    console.log(`Aplicando: ${sql}`);
    await prisma.$executeRawUnsafe(sql);
  }

  console.log('Migração concluída. Campo session_version adicionado ao users.');
}

main()
  .catch((error) => {
    console.error('Falha ao executar migração de session_version:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
