ALTER TABLE usuarios
  ADD COLUMN reset_code_hash VARCHAR(255) NULL,
  ADD COLUMN reset_code_expires DATETIME NULL;
