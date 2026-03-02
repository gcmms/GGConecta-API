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
  CREATE TABLE IF NOT EXISTS birthday_message_templates (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    channel VARCHAR(30) NOT NULL,
    title VARCHAR(255) NULL,
    body TEXT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_birthday_message_templates PRIMARY KEY (id),
    CONSTRAINT uq_birthday_message_templates_name UNIQUE KEY (name),
    INDEX idx_birthday_message_templates_channel (channel)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  `
  INSERT IGNORE INTO birthday_message_templates (name, channel, title, body, is_active)
  VALUES
  (
    'Parabéns Padrão',
    'Push',
    'Feliz aniversário!',
    'Querido(a) {primeiro_nome}, a IPIGG deseja um feliz aniversário! Que Deus abençoe seus {idade} anos com saúde e alegria.',
    1
  ),
  (
    'Aniversário com Versículo',
    'Email',
    'Hoje é um dia especial, {primeiro_nome}!',
    'Parabéns, {primeiro_nome}! Que o Senhor te fortaleça neste novo ciclo. "Este é o dia que o Senhor fez; regozijemo-nos e alegremo-nos nele." (Salmos 118:24)',
    1
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
    console.log('Criando estrutura de templates de aniversário...');
    for (const statement of statements) {
      await pool.execute(statement);
    }
    console.log('Estrutura e seeds de templates criadas com sucesso.');
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error('Falha ao criar estrutura de templates de aniversário:', error);
  process.exitCode = 1;
});
