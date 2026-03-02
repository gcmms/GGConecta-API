import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const columns = [
  { name: 'secondary_phone', definition: 'VARCHAR(255) NULL' },
  { name: 'social_name', definition: 'VARCHAR(255) NULL' },
  { name: 'gender', definition: 'VARCHAR(30) NULL' },
  { name: 'marital_status', definition: 'VARCHAR(50) NULL' },
  { name: 'cpf', definition: 'VARCHAR(20) NULL' },
  { name: 'rg_number', definition: 'VARCHAR(30) NULL' },
  { name: 'rg_issuer', definition: 'VARCHAR(100) NULL' },
  { name: 'rg_state', definition: 'VARCHAR(10) NULL' },
  { name: 'baptism_date', definition: 'DATE NULL' },
  { name: 'profession_faith_date', definition: 'DATE NULL' },
  { name: 'emergency_contact_name', definition: 'VARCHAR(255) NULL' },
  { name: 'emergency_contact_phone', definition: 'VARCHAR(255) NULL' },
  { name: 'person_type', definition: "VARCHAR(20) NOT NULL DEFAULT 'Membro'" },
  { name: 'member_status', definition: 'VARCHAR(40) NULL' },
  { name: 'church_entry_date', definition: 'DATE NULL' },
  { name: 'church_origin', definition: 'VARCHAR(255) NULL' },
  { name: 'internal_notes', definition: 'TEXT NULL' }
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
    console.log('Nenhuma coluna pendente. Tabela users já possui os campos de perfil.');
    return;
  }

  for (const col of missing) {
    const sql = `ALTER TABLE users ADD COLUMN ${col.name} ${col.definition}`;
    console.log(`Aplicando: ${sql}`);
    await prisma.$executeRawUnsafe(sql);
  }

  const backfillSql = `
    UPDATE users
    SET person_type = CASE
      WHEN role = 'Não membro' THEN 'Visitante'
      ELSE 'Membro'
    END
    WHERE person_type IS NULL OR person_type = '' OR (role = 'Não membro' AND person_type = 'Membro')
  `;
  console.log(`Aplicando: ${backfillSql.trim()}`);
  await prisma.$executeRawUnsafe(backfillSql);

  console.log('Migração concluída. Campos de perfil adicionados ao users.');
}

main()
  .catch((error) => {
    console.error('Falha ao executar migração de campos de perfil:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
