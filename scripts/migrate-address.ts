import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const columns = [
  { name: 'address_street', definition: 'VARCHAR(255) NULL' },
  { name: 'address_number', definition: 'VARCHAR(50) NULL' },
  { name: 'address_district', definition: 'VARCHAR(255) NULL' },
  { name: 'address_city', definition: 'VARCHAR(255) NULL' },
  { name: 'address_state', definition: 'VARCHAR(100) NULL' },
  { name: 'address_zip', definition: 'VARCHAR(50) NULL' },
  { name: 'address_complement', definition: 'VARCHAR(255) NULL' }
];

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
    console.log('Nenhuma coluna pendente. Tabela users já possui os campos de endereço.');
    return;
  }

  for (const col of missing) {
    const sql = `ALTER TABLE users ADD COLUMN ${col.name} ${col.definition}`;
    console.log(`Aplicando: ${sql}`);
    await prisma.$executeRawUnsafe(sql);
  }

  console.log('Migração concluída. Campos de endereço adicionados ao users.');
}

main()
  .catch((error) => {
    console.error('Falha ao executar migração de endereço:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
