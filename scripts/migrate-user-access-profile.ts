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

async function hasColumn(pool: ReturnType<typeof createPool>) {
  const [rows] = await pool.query(
    `
      SELECT 1
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'access_profile_id'
      LIMIT 1
    `
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function hasForeignKey(pool: ReturnType<typeof createPool>) {
  const [rows] = await pool.query(
    `
      SELECT 1
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'access_profile_id'
        AND REFERENCED_TABLE_NAME = 'access_profiles'
      LIMIT 1
    `
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function hasIndex(pool: ReturnType<typeof createPool>) {
  const [rows] = await pool.query(
    `
      SHOW INDEX FROM users WHERE Key_name = 'idx_users_access_profile_id'
    `
  );
  return Array.isArray(rows) && rows.length > 0;
}

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
    console.log('Aplicando migração de vínculo user -> access_profile...');

    if (!(await hasColumn(pool))) {
      await pool.execute(
        `
          ALTER TABLE users
            ADD COLUMN access_profile_id INT UNSIGNED NULL AFTER session_version
        `
      );
      console.log('Coluna users.access_profile_id criada.');
    }

    if (!(await hasIndex(pool))) {
      await pool.execute(
        `
          CREATE INDEX idx_users_access_profile_id ON users (access_profile_id)
        `
      );
      console.log('Índice idx_users_access_profile_id criado.');
    }

    if (!(await hasForeignKey(pool))) {
      await pool.execute(
        `
          ALTER TABLE users
            ADD CONSTRAINT fk_users_access_profile
            FOREIGN KEY (access_profile_id)
            REFERENCES access_profiles (id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
        `
      );
      console.log('FK fk_users_access_profile criada.');
    }

    console.log('Migração concluída com sucesso.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Falha na migração de vínculo user -> access_profile:', error);
  process.exitCode = 1;
});

