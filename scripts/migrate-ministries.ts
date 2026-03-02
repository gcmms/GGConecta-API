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
  CREATE TABLE IF NOT EXISTS ministries (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(120) NULL,
    description TEXT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    leader_user_id INT UNSIGNED NULL,
    presbyter_user_id INT UNSIGNED NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_ministries PRIMARY KEY (id),
    CONSTRAINT uq_ministries_name UNIQUE KEY (name),
    CONSTRAINT fk_ministries_leader_user FOREIGN KEY (leader_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_ministries_presbyter_user FOREIGN KEY (presbyter_user_id) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_ministries_leader_user_id (leader_user_id),
    INDEX idx_ministries_presbyter_user_id (presbyter_user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  `
  CREATE TABLE IF NOT EXISTS ministry_members (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    ministry_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_ministry_members PRIMARY KEY (id),
    CONSTRAINT uq_ministry_members UNIQUE KEY (ministry_id, user_id),
    CONSTRAINT fk_ministry_members_ministry FOREIGN KEY (ministry_id) REFERENCES ministries (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_ministry_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_ministry_members_ministry_id (ministry_id),
    INDEX idx_ministry_members_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
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
    console.log('Criando estrutura de ministérios...');
    for (const statement of statements) {
      await pool.execute(statement);
    }

    const [columnRows] = await pool.query<any[]>(
      `
      SELECT 1
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'ministries'
        AND COLUMN_NAME = 'presbyter_user_id'
      LIMIT 1
      `,
      [database]
    );

    if (columnRows.length === 0) {
      await pool.execute(`ALTER TABLE ministries ADD COLUMN presbyter_user_id INT UNSIGNED NULL`);
    }

    const [indexRows] = await pool.query<any[]>(
      `
      SELECT 1
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'ministries'
        AND INDEX_NAME = 'idx_ministries_presbyter_user_id'
      LIMIT 1
      `,
      [database]
    );

    if (indexRows.length === 0) {
      await pool.execute(
        `ALTER TABLE ministries ADD INDEX idx_ministries_presbyter_user_id (presbyter_user_id)`
      );
    }

    const [fkRows] = await pool.query<any[]>(
      `
      SELECT 1
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'ministries'
        AND COLUMN_NAME = 'presbyter_user_id'
        AND REFERENCED_TABLE_NAME = 'users'
        AND REFERENCED_COLUMN_NAME = 'id'
      LIMIT 1
      `,
      [database]
    );

    if (fkRows.length === 0) {
      await pool.execute(`
        ALTER TABLE ministries
        ADD CONSTRAINT fk_ministries_presbyter_user
        FOREIGN KEY (presbyter_user_id) REFERENCES users (id)
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
    }
    console.log('Estrutura de ministérios criada com sucesso.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Falha ao criar estrutura de ministérios:', error);
  process.exitCode = 1;
});
