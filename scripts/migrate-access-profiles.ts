import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { createPool } from 'mysql2/promise';

const envPath = resolve(process.cwd(), '.env');

function loadEnvFileIfNeeded() {
  if (!existsSync(envPath)) return;

  const envContent = readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex <= 0) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const statements = [
  `
  CREATE TABLE IF NOT EXISTS access_profiles (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    base_role VARCHAR(50) NULL,
    is_system TINYINT(1) NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    can_dashboard TINYINT(1) NOT NULL DEFAULT 0,
    can_people TINYINT(1) NOT NULL DEFAULT 0,
    can_ministries TINYINT(1) NOT NULL DEFAULT 0,
    can_posts TINYINT(1) NOT NULL DEFAULT 0,
    can_prayers TINYINT(1) NOT NULL DEFAULT 0,
    can_events TINYINT(1) NOT NULL DEFAULT 0,
    can_schedules TINYINT(1) NOT NULL DEFAULT 0,
    can_birthdays TINYINT(1) NOT NULL DEFAULT 0,
    can_inventory TINYINT(1) NOT NULL DEFAULT 0,
    can_settings TINYINT(1) NOT NULL DEFAULT 0,
    can_access_profiles TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_access_profiles PRIMARY KEY (id),
    CONSTRAINT uq_access_profiles_name UNIQUE KEY (name),
    CONSTRAINT uq_access_profiles_slug UNIQUE KEY (slug),
    INDEX idx_access_profiles_role_active (base_role, is_active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  `
  INSERT IGNORE INTO access_profiles (
    name,
    slug,
    base_role,
    is_system,
    is_active,
    can_dashboard,
    can_people,
    can_ministries,
    can_posts,
    can_prayers,
    can_events,
    can_schedules,
    can_birthdays,
    can_inventory,
    can_settings,
    can_access_profiles
  )
  VALUES
  (
    'Administrador',
    'administrador',
    'Administrador',
    1,
    1,
    1,1,1,1,1,1,1,1,1,1,1
  ),
  (
    'Membro Ativo',
    'membro-ativo',
    'Membro',
    1,
    1,
    1,0,0,1,1,1,0,0,0,0,0
  )
  `
];

async function main() {
  loadEnvFileIfNeeded();

  const host = process.env.DB_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME;
  const socketPath = process.env.DB_SOCKET_PATH || undefined;

  if (!database) {
    throw new Error('DB_NAME não configurado no ambiente.');
  }

  const pool = createPool({
    host: socketPath ? undefined : host,
    port: socketPath ? undefined : port,
    socketPath,
    user,
    password,
    database,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10)
  });

  try {
    console.log('Criando estrutura de perfis de acesso...');
    for (const statement of statements) {
      await pool.execute(statement);
    }
    console.log('Estrutura e perfis padrão criados com sucesso.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Falha ao criar estrutura de perfis de acesso:', error);
  process.exitCode = 1;
});

