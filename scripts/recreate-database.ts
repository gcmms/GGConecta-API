import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const dropStatements = [
  'DROP TABLE IF EXISTS birthday_message_templates',
  'DROP TABLE IF EXISTS ministry_members',
  'DROP TABLE IF EXISTS ministries',
  'DROP TABLE IF EXISTS community_post_comments',
  'DROP TABLE IF EXISTS community_post_likes',
  'DROP TABLE IF EXISTS community_posts',
  'DROP TABLE IF EXISTS mural',
  'DROP TABLE IF EXISTS users'
];

const createStatements = [
  `
  CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NULL,
    secondary_phone VARCHAR(255) NULL,
    social_name VARCHAR(255) NULL,
    gender VARCHAR(30) NULL,
    marital_status VARCHAR(50) NULL,
    cpf VARCHAR(20) NULL,
    rg_number VARCHAR(30) NULL,
    rg_issuer VARCHAR(100) NULL,
    rg_state VARCHAR(10) NULL,
    baptism_date DATE NULL,
    profession_faith_date DATE NULL,
    emergency_contact_name VARCHAR(255) NULL,
    emergency_contact_phone VARCHAR(255) NULL,
    person_type VARCHAR(20) NOT NULL DEFAULT 'Membro',
    member_status VARCHAR(40) NULL,
    church_entry_date DATE NULL,
    church_origin VARCHAR(255) NULL,
    internal_notes TEXT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Membro',
    password_hash VARCHAR(255) NOT NULL,
    address_street VARCHAR(255) NULL,
    address_number VARCHAR(50) NULL,
    address_district VARCHAR(255) NULL,
    address_city VARCHAR(255) NULL,
    address_state VARCHAR(100) NULL,
    address_zip VARCHAR(50) NULL,
    address_complement VARCHAR(255) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE KEY (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
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
  `,
  `
  INSERT INTO birthday_message_templates (name, channel, title, body, is_active)
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
  `,
  `
  CREATE TABLE IF NOT EXISTS mural (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255) NOT NULL,
    publish_date DATE NOT NULL,
    link VARCHAR(2048) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_mural PRIMARY KEY (id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  `
  CREATE TABLE IF NOT EXISTS community_posts (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_community_posts PRIMARY KEY (id),
    CONSTRAINT fk_community_posts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_community_posts_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  `
  CREATE TABLE IF NOT EXISTS community_post_likes (
    id INT NOT NULL AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    CONSTRAINT pk_community_post_likes PRIMARY KEY (id),
    CONSTRAINT fk_community_post_likes_post FOREIGN KEY (post_id) REFERENCES community_posts (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_community_post_likes_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_community_post_likes UNIQUE KEY (post_id, user_id),
    INDEX idx_community_post_likes_post_id (post_id),
    INDEX idx_community_post_likes_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `,
  `
  CREATE TABLE IF NOT EXISTS community_post_comments (
    id INT NOT NULL AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_community_post_comments PRIMARY KEY (id),
    CONSTRAINT fk_community_post_comments_post FOREIGN KEY (post_id) REFERENCES community_posts (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_community_post_comments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_community_post_comments_post_id (post_id),
    INDEX idx_community_post_comments_user_id (user_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `
];

async function recreateDatabase() {
  console.log('Desativando verificacao de chave estrangeira...');
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

  try {
    for (const statement of dropStatements) {
      console.log(`Executando: ${statement}`);
      await prisma.$executeRawUnsafe(statement);
    }

    for (const statement of createStatements) {
      console.log('Executando:');
      console.log(statement);
      await prisma.$executeRawUnsafe(statement);
    }

    console.log('Criando usuario admin padrao...');
    const passwordHash = await bcrypt.hash('123456', 10);
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO users (
        first_name,
        last_name,
        birth_date,
        email,
        role,
        password_hash,
        person_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        role = VALUES(role),
        password_hash = VALUES(password_hash)
      `,
      'Admin',
      'Sistema',
      '1990-01-01',
      'admin@admin.com',
      'Administrador',
      passwordHash,
      'Membro'
    );
    console.log('Usuario admin padrao criado/atualizado com sucesso.');
  } finally {
    console.log('Reativando verificacao de chave estrangeira...');
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  }
}

async function main() {
  console.log('Recriando base do zero utilizando Prisma...');
  await recreateDatabase();
  console.log('Base recriada com sucesso.');
}

main()
  .catch((error) => {
    console.error('Falha ao recriar o banco:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
