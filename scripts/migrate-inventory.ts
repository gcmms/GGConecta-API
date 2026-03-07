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
  CREATE TABLE IF NOT EXISTS inventory_items (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    ministry_id INT UNSIGNED NOT NULL,
    name VARCHAR(180) NOT NULL,
    patrimony_number VARCHAR(120) NOT NULL,
    storage_location VARCHAR(180) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'Disponivel',
    notes TEXT NULL,
    disposed_at DATETIME(6) NULL,
    disposal_reason TEXT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_inventory_items PRIMARY KEY (id),
    CONSTRAINT uq_inventory_items_patrimony_number UNIQUE KEY (patrimony_number),
    INDEX idx_inventory_items_ministry_id (ministry_id),
    INDEX idx_inventory_items_status (status),
    CONSTRAINT fk_inventory_items_ministry
      FOREIGN KEY (ministry_id) REFERENCES ministries(id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  `
  CREATE TABLE IF NOT EXISTS inventory_loans (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    item_id INT UNSIGNED NOT NULL,
    origin_ministry_id INT UNSIGNED NOT NULL,
    destination_ministry_id INT UNSIGNED NOT NULL,
    loaned_at DATETIME(6) NOT NULL,
    expected_return_date DATE NULL,
    returned_at DATETIME(6) NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'Aberto',
    notes TEXT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_inventory_loans PRIMARY KEY (id),
    INDEX idx_inventory_loans_item_id (item_id),
    INDEX idx_inventory_loans_origin_ministry_id (origin_ministry_id),
    INDEX idx_inventory_loans_destination_ministry_id (destination_ministry_id),
    INDEX idx_inventory_loans_status (status),
    CONSTRAINT fk_inventory_loans_item
      FOREIGN KEY (item_id) REFERENCES inventory_items(id)
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inventory_loans_origin_ministry
      FOREIGN KEY (origin_ministry_id) REFERENCES ministries(id)
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inventory_loans_destination_ministry
      FOREIGN KEY (destination_ministry_id) REFERENCES ministries(id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  `
  CREATE TABLE IF NOT EXISTS inventory_maintenance_requests (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    item_id INT UNSIGNED NOT NULL,
    requester_ministry_id INT UNSIGNED NOT NULL,
    report_number VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(30) NOT NULL DEFAULT 'Média',
    status VARCHAR(40) NOT NULL DEFAULT 'Aberta',
    requested_at DATETIME(6) NOT NULL,
    due_date DATE NULL,
    resolved_at DATETIME(6) NULL,
    resolution_notes TEXT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_inventory_maintenance_requests PRIMARY KEY (id),
    CONSTRAINT uq_inventory_maintenance_report_number UNIQUE KEY (report_number),
    INDEX idx_inventory_maintenance_item_id (item_id),
    INDEX idx_inventory_maintenance_requester_ministry_id (requester_ministry_id),
    INDEX idx_inventory_maintenance_status (status),
    CONSTRAINT fk_inventory_maintenance_item
      FOREIGN KEY (item_id) REFERENCES inventory_items(id)
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_inventory_maintenance_requester_ministry
      FOREIGN KEY (requester_ministry_id) REFERENCES ministries(id)
      ON DELETE RESTRICT ON UPDATE CASCADE
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
    console.log('Criando estrutura de inventário...');
    for (const statement of statements) {
      await pool.execute(statement);
    }
    console.log('Estrutura de inventário criada com sucesso.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Falha ao criar estrutura de inventário:', error);
  process.exitCode = 1;
});
