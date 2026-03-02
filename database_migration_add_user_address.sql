-- Adiciona colunas de endereço se ainda não existirem (MySQL)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS address_street VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS address_number VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS address_district VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS address_city VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS address_state VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS address_zip VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS address_complement VARCHAR(255) NULL;
