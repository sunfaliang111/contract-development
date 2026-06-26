CREATE TABLE IF NOT EXISTS m_codes (
  code_type VARCHAR(64) NOT NULL,
  code VARCHAR(64) NOT NULL,
  code_value VARCHAR(256) NOT NULL,
  code_value_kana VARCHAR(256) NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  remarks TEXT NULL,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  registered_by VARCHAR(128) NOT NULL DEFAULT 'system',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(128) NOT NULL DEFAULT 'system',
  PRIMARY KEY (code_type, code),
  INDEX idx_m_codes_type_order (code_type, display_order)
);

CREATE TABLE IF NOT EXISTS m_customers (
  id VARCHAR(36) NOT NULL,
  company_name VARCHAR(256) NOT NULL,
  company_name_kana VARCHAR(256) NULL,
  representative_name VARCHAR(128) NULL,
  postal_code VARCHAR(10) NULL,
  address VARCHAR(256) NULL,
  building_name VARCHAR(256) NULL,
  phone_number VARCHAR(24) NULL,
  fax_number VARCHAR(24) NULL,
  invoice_no VARCHAR(14) NULL,
  site_url VARCHAR(512) NULL,
  proposal_category_code VARCHAR(32) NULL,
  importance_code VARCHAR(32) NULL,
  scheduled_contract_start_date DATE NULL,
  contract_conclusion_date DATE NULL,
  scheduled_contract_end_date DATE NULL,
  contract_end_date DATE NULL,
  primary_sales VARCHAR(128) NULL,
  secondary_sales VARCHAR(128) NULL,
  remarks TEXT NULL,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  registered_by VARCHAR(128) NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(128) NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_m_customers_company_name (company_name),
  UNIQUE KEY uk_m_customers_invoice_no (invoice_no)
);

DROP PROCEDURE IF EXISTS add_column_if_missing;
DELIMITER //
CREATE PROCEDURE add_column_if_missing(
  IN table_name_param VARCHAR(64),
  IN column_name_param VARCHAR(64),
  IN column_definition_param TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name_param
      AND COLUMN_NAME = column_name_param
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE ', table_name_param, ' ADD COLUMN ', column_name_param, ' ', column_definition_param);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

CALL add_column_if_missing('m_customers', 'invoice_no', 'VARCHAR(14) NULL');
CALL add_column_if_missing('m_customers', 'proposal_category_code', 'VARCHAR(32) NULL');
CALL add_column_if_missing('m_customers', 'importance_code', 'VARCHAR(32) NULL');
CALL add_column_if_missing('m_customers', 'scheduled_contract_start_date', 'DATE NULL');
CALL add_column_if_missing('m_customers', 'scheduled_contract_end_date', 'DATE NULL');
CALL add_column_if_missing('m_customers', 'contract_end_date', 'DATE NULL');

CREATE TABLE IF NOT EXISTS m_projects (
  project_id VARCHAR(36) NOT NULL,
  project_name VARCHAR(256) NOT NULL,
  project_overview TEXT NOT NULL,
  project_detail TEXT NULL,
  skills TEXT NULL,
  age_from INT NULL,
  age_to INT NULL,
  foreign_acceptance_code VARCHAR(32) NOT NULL DEFAULT 'ACCEPTABLE',
  billing_rate DECIMAL(12, 0) NULL,
  unit_payment_price DECIMAL(12, 0) NULL,
  number_of_interviews INT NULL DEFAULT 1,
  commercial_flow_code VARCHAR(32) NOT NULL,
  station VARCHAR(128) NULL,
  begin_date DATE NOT NULL,
  end_date DATE NULL,
  representative_sales_name VARCHAR(128) NULL,
  customer_id VARCHAR(36) NULL,
  remarks TEXT NULL,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  registered_by VARCHAR(128) NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(128) NOT NULL,
  PRIMARY KEY (project_id),
  INDEX idx_m_projects_customer_id (customer_id),
  INDEX idx_m_projects_project_name (project_name),
  CONSTRAINT fk_m_projects_customer FOREIGN KEY (customer_id) REFERENCES m_customers (id)
);

CREATE TABLE IF NOT EXISTS m_personnel (
  personnel_id VARCHAR(36) NOT NULL,
  personnel_name VARCHAR(256) NOT NULL,
  personnel_name_kana VARCHAR(256) NULL,
  personnel_name_display VARCHAR(256) NULL,
  contract_type_code VARCHAR(32) NOT NULL,
  affiliation VARCHAR(256) NULL,
  skills TEXT NOT NULL,
  birth_date DATE NOT NULL,
  sex_code VARCHAR(32) NOT NULL,
  nationality_code VARCHAR(32) NOT NULL DEFAULT 'JAPANESE',
  price DECIMAL(12, 0) NOT NULL,
  station VARCHAR(128) NULL,
  start_date DATE NULL,
  representative_sales_name VARCHAR(128) NULL,
  availability_code VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
  project_id VARCHAR(36) NULL,
  remarks TEXT NULL,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  registered_by VARCHAR(128) NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(128) NOT NULL,
  PRIMARY KEY (personnel_id),
  INDEX idx_m_personnel_name (personnel_name)
);

CALL add_column_if_missing('m_personnel', 'project_id', 'VARCHAR(36) NULL');
DROP PROCEDURE IF EXISTS add_column_if_missing;

CREATE TABLE IF NOT EXISTS t_project_personnel (
  project_personnel_id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  personnel_id VARCHAR(36) NOT NULL,
  assignment_status_code VARCHAR(32) NOT NULL DEFAULT 'PROPOSED',
  assigned_from DATE NULL,
  assigned_to DATE NULL,
  billing_rate DECIMAL(12, 0) NULL,
  payment_price DECIMAL(12, 0) NULL,
  remarks TEXT NULL,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  registered_by VARCHAR(128) NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(128) NOT NULL,
  PRIMARY KEY (project_personnel_id),
  UNIQUE KEY uk_t_project_personnel_current (project_id, personnel_id, assigned_from),
  CONSTRAINT fk_t_project_personnel_project FOREIGN KEY (project_id) REFERENCES m_projects (project_id),
  CONSTRAINT fk_t_project_personnel_personnel FOREIGN KEY (personnel_id) REFERENCES m_personnel (personnel_id)
);

CREATE TABLE IF NOT EXISTS t_project_job_categories (
  project_id VARCHAR(36) NOT NULL,
  job_category_code VARCHAR(64) NOT NULL,
  remarks TEXT NULL,
  PRIMARY KEY (project_id, job_category_code),
  CONSTRAINT fk_t_project_job_categories_project FOREIGN KEY (project_id) REFERENCES m_projects (project_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS t_personnel_job_categories (
  personnel_id VARCHAR(36) NOT NULL,
  job_category_code VARCHAR(64) NOT NULL,
  remarks TEXT NULL,
  PRIMARY KEY (personnel_id, job_category_code),
  CONSTRAINT fk_t_personnel_job_categories_personnel FOREIGN KEY (personnel_id) REFERENCES m_personnel (personnel_id) ON DELETE CASCADE
);

INSERT INTO m_codes (code_type, code, code_value, display_order, is_active, registered_by, updated_by) VALUES
('COMMERCIAL_FLOW', 'END_DIRECT', 'エンド直', 10, TRUE, 'system', 'system'),
('COMMERCIAL_FLOW', 'PRIME', '元請け', 20, TRUE, 'system', 'system'),
('COMMERCIAL_FLOW', 'FIRST_SUB', '一次請け', 30, TRUE, 'system', 'system'),
('COMMERCIAL_FLOW', 'SECOND_OR_MORE', '二次請け以下', 40, TRUE, 'system', 'system'),
('CONTRACT_TYPE', 'EMPLOYEE', '正社員', 10, TRUE, 'system', 'system'),
('CONTRACT_TYPE', 'CONTRACT_EMPLOYEE', '契約社員', 20, TRUE, 'system', 'system'),
('CONTRACT_TYPE', 'BP', 'BP', 30, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'CONSULTANT', 'コンサルタント', 10, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'PM', 'PM', 20, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'PL', 'PL', 30, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'PMO', 'PMO', 40, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'SE', 'SE', 50, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'PG', 'PG', 60, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'TESTER', 'テスター', 70, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'SERVER_ENGINEER', 'サーバエンジニア', 80, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'NETWORK_ENGINEER', 'ネットワークエンジニア', 90, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'WEB_DESIGNER', 'WEBデザイナー', 100, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'WEB_DIRECTOR', 'WEBディレクター', 110, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'HELPDESK_KITTING', 'ヘルプデスク・キッティング', 120, TRUE, 'system', 'system'),
('JOB_CATEGORY', 'OTHER', 'その他', 999, TRUE, 'system', 'system'),
('PROPOSAL_CATEGORY', 'PROJECT', '案件', 10, TRUE, 'system', 'system'),
('PROPOSAL_CATEGORY', 'PERSONNEL', '人材', 20, TRUE, 'system', 'system'),
('IMPORTANCE', 'HIGH', '高', 10, TRUE, 'system', 'system'),
('IMPORTANCE', 'MIDDLE', '中', 20, TRUE, 'system', 'system'),
('IMPORTANCE', 'LOW', '低', 30, TRUE, 'system', 'system'),
('SEX', 'MALE', '男性', 10, TRUE, 'system', 'system'),
('SEX', 'FEMALE', '女性', 20, TRUE, 'system', 'system'),
('NATIONALITY_TYPE', 'JAPANESE', '日本人', 10, TRUE, 'system', 'system'),
('NATIONALITY_TYPE', 'FOREIGN', '外国籍', 20, TRUE, 'system', 'system'),
('FOREIGN_ACCEPTANCE', 'ACCEPTABLE', '外国籍可', 10, TRUE, 'system', 'system'),
('FOREIGN_ACCEPTANCE', 'NOT_ACCEPTABLE', '外国籍不可', 20, TRUE, 'system', 'system'),
('ASSIGNMENT_AVAILABILITY', 'AVAILABLE', '可', 10, TRUE, 'system', 'system'),
('ASSIGNMENT_AVAILABILITY', 'UNAVAILABLE', '不可', 20, TRUE, 'system', 'system'),
('ASSIGNMENT_STATUS', 'PROPOSED', '提案中', 10, TRUE, 'system', 'system'),
('ASSIGNMENT_STATUS', 'ASSIGNED', 'アサイン済', 20, TRUE, 'system', 'system'),
('ASSIGNMENT_STATUS', 'ENDED', '終了', 30, TRUE, 'system', 'system')
ON DUPLICATE KEY UPDATE
  code_value = VALUES(code_value),
  display_order = VALUES(display_order),
  is_active = VALUES(is_active),
  updated_by = VALUES(updated_by);
