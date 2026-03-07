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
  CREATE TABLE IF NOT EXISTS internal_events (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    title VARCHAR(180) NOT NULL,
    description TEXT NULL,
    location VARCHAR(255) NULL,
    start_date DATETIME(6) NOT NULL,
    end_date DATETIME(6) NOT NULL,
    all_day TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_internal_events PRIMARY KEY (id),
    INDEX idx_internal_events_start_date (start_date),
    INDEX idx_internal_events_end_date (end_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  `
  CREATE TABLE IF NOT EXISTS ministry_schedule_templates (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    ministry_id INT UNSIGNED NOT NULL,
    slot_name VARCHAR(120) NOT NULL,
    quantity INT UNSIGNED NOT NULL DEFAULT 1,
    sort_order INT UNSIGNED NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_ministry_schedule_templates PRIMARY KEY (id),
    INDEX idx_ministry_schedule_templates_ministry_id (ministry_id),
    CONSTRAINT fk_ministry_schedule_templates_ministry
      FOREIGN KEY (ministry_id) REFERENCES ministries(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  `
  CREATE TABLE IF NOT EXISTS event_ministry_schedules (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    event_key VARCHAR(255) NOT NULL,
    event_source VARCHAR(30) NOT NULL,
    event_title VARCHAR(180) NOT NULL,
    event_start_date DATETIME(6) NULL,
    ministry_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_event_ministry_schedules PRIMARY KEY (id),
    CONSTRAINT uq_event_ministry_schedules_event_ministry UNIQUE KEY (event_key, ministry_id),
    INDEX idx_event_ministry_schedules_event_key (event_key),
    INDEX idx_event_ministry_schedules_ministry_id (ministry_id),
    CONSTRAINT fk_event_ministry_schedules_ministry
      FOREIGN KEY (ministry_id) REFERENCES ministries(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  `
  CREATE TABLE IF NOT EXISTS event_ministry_assignments (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    schedule_id INT UNSIGNED NOT NULL,
    slot_name VARCHAR(120) NOT NULL,
    slot_order INT UNSIGNED NOT NULL DEFAULT 1,
    person_id INT UNSIGNED NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'Pendente',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_event_ministry_assignments PRIMARY KEY (id),
    INDEX idx_event_ministry_assignments_schedule_id (schedule_id),
    INDEX idx_event_ministry_assignments_person_id (person_id),
    CONSTRAINT fk_event_ministry_assignments_schedule
      FOREIGN KEY (schedule_id) REFERENCES event_ministry_schedules(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_event_ministry_assignments_person
      FOREIGN KEY (person_id) REFERENCES users(id)
      ON DELETE SET NULL ON UPDATE CASCADE
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
    console.log('Criando estrutura de eventos internos...');
    for (const statement of statements) {
      await pool.execute(statement);
    }
    console.log('Estrutura de eventos internos criada com sucesso.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Falha ao criar estrutura de eventos internos:', error);
  process.exitCode = 1;
});
