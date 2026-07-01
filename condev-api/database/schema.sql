SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS t_monthly_sales;
DROP TABLE IF EXISTS t_documents;
DROP TABLE IF EXISTS m_document_templates;
DROP TABLE IF EXISTS t_billing_items;
DROP TABLE IF EXISTS t_contract_terms;
DROP TABLE IF EXISTS t_contracts;
DROP TABLE IF EXISTS t_proposal_activities;
DROP TABLE IF EXISTS t_proposals;
DROP TABLE IF EXISTS t_project_engineer_matches;
DROP TABLE IF EXISTS t_project_personnel;
DROP TABLE IF EXISTS t_resume_projects;
DROP TABLE IF EXISTS t_resumes;
DROP TABLE IF EXISTS t_engineer_job_categories;
DROP TABLE IF EXISTS t_engineer_skills;
DROP TABLE IF EXISTS t_project_job_categories;
DROP TABLE IF EXISTS t_project_required_skills;
DROP TABLE IF EXISTS t_projects;
DROP TABLE IF EXISTS m_engineers;
DROP TABLE IF EXISTS m_customer_contacts;
DROP TABLE IF EXISTS m_customers;
DROP TABLE IF EXISTS m_locations;
DROP TABLE IF EXISTS m_skills;
DROP TABLE IF EXISTS m_departments;
DROP TABLE IF EXISTS m_users;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS m_projects;
DROP TABLE IF EXISTS m_personnel;
DROP TABLE IF EXISTS t_personnel_job_categories;
DROP TABLE IF EXISTS m_codes;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE m_codes (
  code_type VARCHAR(64) NOT NULL,
  code VARCHAR(64) NOT NULL,
  code_value VARCHAR(256) NOT NULL,
  code_value_kana VARCHAR(256) NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  remarks TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(128) NULL DEFAULT 'system',
  updated_by VARCHAR(128) NULL DEFAULT 'system',
  PRIMARY KEY (code_type, code),
  INDEX idx_m_codes_type_order (code_type, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE m_departments (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  parent_id VARCHAR(36) NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  INDEX idx_m_departments_parent (parent_id),
  CONSTRAINT fk_m_departments_parent FOREIGN KEY (parent_id) REFERENCES m_departments (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE m_users (
  id VARCHAR(36) NOT NULL,
  department_id VARCHAR(36) NULL,
  company_name VARCHAR(120) NOT NULL,
  user_name VARCHAR(80) NOT NULL,
  name VARCHAR(100) GENERATED ALWAYS AS (user_name) STORED,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'sales',
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_m_users_email (email),
  INDEX idx_m_users_role (role),
  INDEX idx_m_users_department (department_id),
  CONSTRAINT fk_m_users_department FOREIGN KEY (department_id) REFERENCES m_departments (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE m_skills (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(64) NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_m_skills_name (name),
  INDEX idx_m_skills_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE m_locations (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(32) NOT NULL,
  parent_id VARCHAR(36) NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  INDEX idx_m_locations_type (type),
  INDEX idx_m_locations_parent (parent_id),
  CONSTRAINT fk_m_locations_parent FOREIGN KEY (parent_id) REFERENCES m_locations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE m_customers (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_kana VARCHAR(255) NULL,
  customer_type VARCHAR(32) NOT NULL DEFAULT 'other',
  industry VARCHAR(100) NULL,
  website VARCHAR(255) NULL,
  postal_code VARCHAR(20) NULL,
  address VARCHAR(500) NULL,
  representative_name VARCHAR(128) NULL,
  building_name VARCHAR(256) NULL,
  phone VARCHAR(50) NULL,
  fax_number VARCHAR(24) NULL,
  invoice_no VARCHAR(14) NULL,
  proposal_category_code VARCHAR(32) NULL,
  importance_code VARCHAR(32) NULL,
  scheduled_contract_start_date DATE NULL,
  contract_conclusion_date DATE NULL,
  scheduled_contract_end_date DATE NULL,
  contract_end_date DATE NULL,
  primary_sales VARCHAR(128) NULL,
  secondary_sales VARCHAR(128) NULL,
  owner_user_id VARCHAR(36) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  created_by VARCHAR(128) NULL,
  updated_by VARCHAR(128) NULL,
  PRIMARY KEY (id),
  INDEX idx_m_customers_name (name),
  INDEX idx_m_customers_type (customer_type),
  INDEX idx_m_customers_owner (owner_user_id),
  UNIQUE KEY uk_m_customers_invoice_no (invoice_no),
  CONSTRAINT fk_m_customers_owner FOREIGN KEY (owner_user_id) REFERENCES m_users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE m_customer_contacts (
  id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100) NULL,
  title VARCHAR(100) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  mobile VARCHAR(50) NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  INDEX idx_m_customer_contacts_customer (customer_id),
  INDEX idx_m_customer_contacts_email (email),
  CONSTRAINT fk_m_customer_contacts_customer FOREIGN KEY (customer_id) REFERENCES m_customers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_projects (
  project_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NULL,
  contact_id VARCHAR(36) NULL,
  owner_user_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  project_detail TEXT NULL,
  skills TEXT NULL,
  required_role VARCHAR(100) NULL,
  required_headcount INT NOT NULL DEFAULT 1,
  age_from INT NULL,
  age_to INT NULL,
  location_id VARCHAR(36) NULL,
  remote_type VARCHAR(32) NULL,
  foreign_acceptance_code VARCHAR(32) NOT NULL DEFAULT 'ACCEPTABLE',
  start_date DATE NULL,
  end_date DATE NULL,
  min_unit_price DECIMAL(12,2) NULL,
  max_unit_price DECIMAL(12,2) NULL,
  billing_rate DECIMAL(12,0) NULL,
  unit_payment_price DECIMAL(12,0) NULL,
  commercial_flow_code VARCHAR(32) NOT NULL,
  contract_type VARCHAR(32) NULL,
  payment_site VARCHAR(50) NULL,
  number_of_interviews INT NULL DEFAULT 1,
  station VARCHAR(128) NULL,
  representative_sales_name VARCHAR(128) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'open',
  priority VARCHAR(32) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  created_by VARCHAR(128) NULL,
  updated_by VARCHAR(128) NULL,
  PRIMARY KEY (project_id),
  INDEX idx_t_projects_status (status),
  INDEX idx_t_projects_customer (customer_id),
  INDEX idx_t_projects_owner (owner_user_id),
  INDEX idx_t_projects_start_date (start_date),
  INDEX idx_t_projects_title (title),
  CONSTRAINT fk_t_projects_customer FOREIGN KEY (customer_id) REFERENCES m_customers (id),
  CONSTRAINT fk_t_projects_contact FOREIGN KEY (contact_id) REFERENCES m_customer_contacts (id),
  CONSTRAINT fk_t_projects_owner FOREIGN KEY (owner_user_id) REFERENCES m_users (id),
  CONSTRAINT fk_t_projects_location FOREIGN KEY (location_id) REFERENCES m_locations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_project_required_skills (
  id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  skill_id VARCHAR(36) NOT NULL,
  requirement_level VARCHAR(32) NOT NULL DEFAULT 'must',
  min_years DECIMAL(4,1) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_t_project_required_skills (project_id, skill_id),
  INDEX idx_t_project_required_skills_skill (skill_id),
  CONSTRAINT fk_t_project_required_skills_project FOREIGN KEY (project_id) REFERENCES t_projects (project_id),
  CONSTRAINT fk_t_project_required_skills_skill FOREIGN KEY (skill_id) REFERENCES m_skills (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_project_job_categories (
  project_id VARCHAR(36) NOT NULL,
  job_category_code VARCHAR(64) NOT NULL,
  remarks TEXT NULL,
  PRIMARY KEY (project_id, job_category_code),
  CONSTRAINT fk_t_project_job_categories_project FOREIGN KEY (project_id) REFERENCES t_projects (project_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE m_engineers (
  engineer_id VARCHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  name_kana VARCHAR(100) NULL,
  personnel_name_display VARCHAR(256) NULL,
  engineer_type VARCHAR(32) NOT NULL DEFAULT 'employee',
  partner_customer_id VARCHAR(36) NULL,
  affiliation VARCHAR(256) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  skills TEXT NOT NULL,
  birth_date DATE NULL,
  sex_code VARCHAR(32) NULL,
  nationality_code VARCHAR(32) NOT NULL DEFAULT 'JAPANESE',
  price DECIMAL(12,0) NULL,
  nearest_station VARCHAR(100) NULL,
  location_id VARCHAR(36) NULL,
  remote_preference VARCHAR(32) NULL,
  available_from DATE NULL,
  current_status VARCHAR(32) NOT NULL DEFAULT 'waiting',
  desired_unit_price DECIMAL(12,2) NULL,
  min_unit_price DECIMAL(12,2) NULL,
  owner_user_id VARCHAR(36) NULL,
  representative_sales_name VARCHAR(128) NULL,
  project_id VARCHAR(36) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  created_by VARCHAR(128) NULL,
  updated_by VARCHAR(128) NULL,
  PRIMARY KEY (engineer_id),
  INDEX idx_m_engineers_status (current_status),
  INDEX idx_m_engineers_owner (owner_user_id),
  INDEX idx_m_engineers_available_from (available_from),
  INDEX idx_m_engineers_partner (partner_customer_id),
  INDEX idx_m_engineers_name (name),
  CONSTRAINT fk_m_engineers_partner FOREIGN KEY (partner_customer_id) REFERENCES m_customers (id),
  CONSTRAINT fk_m_engineers_location FOREIGN KEY (location_id) REFERENCES m_locations (id),
  CONSTRAINT fk_m_engineers_owner FOREIGN KEY (owner_user_id) REFERENCES m_users (id),
  CONSTRAINT fk_m_engineers_project FOREIGN KEY (project_id) REFERENCES t_projects (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_engineer_skills (
  id VARCHAR(36) NOT NULL,
  engineer_id VARCHAR(36) NOT NULL,
  skill_id VARCHAR(36) NOT NULL,
  years DECIMAL(4,1) NULL,
  level VARCHAR(32) NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_t_engineer_skills (engineer_id, skill_id),
  INDEX idx_t_engineer_skills_skill (skill_id),
  CONSTRAINT fk_t_engineer_skills_engineer FOREIGN KEY (engineer_id) REFERENCES m_engineers (engineer_id),
  CONSTRAINT fk_t_engineer_skills_skill FOREIGN KEY (skill_id) REFERENCES m_skills (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_engineer_job_categories (
  engineer_id VARCHAR(36) NOT NULL,
  job_category_code VARCHAR(64) NOT NULL,
  remarks TEXT NULL,
  PRIMARY KEY (engineer_id, job_category_code),
  CONSTRAINT fk_t_engineer_job_categories_engineer FOREIGN KEY (engineer_id) REFERENCES m_engineers (engineer_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_resumes (
  id VARCHAR(36) NOT NULL,
  engineer_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  summary TEXT NULL,
  file_url VARCHAR(500) NULL,
  file_name VARCHAR(255) NULL,
  content_type VARCHAR(120) NULL,
  file_size BIGINT NULL,
  storage_path VARCHAR(500) NULL,
  is_current TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  INDEX idx_t_resumes_engineer (engineer_id),
  INDEX idx_t_resumes_engineer_current (engineer_id, is_current),
  CONSTRAINT fk_t_resumes_engineer FOREIGN KEY (engineer_id) REFERENCES m_engineers (engineer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_resume_projects (
  id VARCHAR(36) NOT NULL,
  resume_id VARCHAR(36) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) NULL,
  role VARCHAR(100) NULL,
  start_month CHAR(7) NULL,
  end_month CHAR(7) NULL,
  description TEXT NULL,
  responsibilities TEXT NULL,
  technologies TEXT NULL,
  team_size INT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_t_resume_projects_resume (resume_id),
  CONSTRAINT fk_t_resume_projects_resume FOREIGN KEY (resume_id) REFERENCES t_resumes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_project_personnel (
  project_personnel_id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  personnel_id VARCHAR(36) NOT NULL,
  assignment_status_code VARCHAR(32) NOT NULL DEFAULT 'PROPOSED',
  assigned_from DATE NULL,
  assigned_to DATE NULL,
  billing_rate DECIMAL(12,0) NULL,
  payment_price DECIMAL(12,0) NULL,
  remarks TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(128) NULL,
  updated_by VARCHAR(128) NULL,
  PRIMARY KEY (project_personnel_id),
  UNIQUE KEY uk_t_project_personnel_current (project_id, personnel_id, assigned_from),
  CONSTRAINT fk_t_project_personnel_project FOREIGN KEY (project_id) REFERENCES t_projects (project_id),
  CONSTRAINT fk_t_project_personnel_engineer FOREIGN KEY (personnel_id) REFERENCES m_engineers (engineer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_project_engineer_matches (
  id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  engineer_id VARCHAR(36) NOT NULL,
  match_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  must_skill_matched_count INT NOT NULL DEFAULT 0,
  must_skill_total_count INT NOT NULL DEFAULT 0,
  price_fit VARCHAR(32) NULL,
  availability_fit VARCHAR(32) NULL,
  location_fit VARCHAR(32) NULL,
  recommendation_level VARCHAR(32) NULL,
  match_reason TEXT NULL,
  created_by_rule TINYINT(1) NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'candidate',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_t_project_engineer_matches (project_id, engineer_id),
  INDEX idx_t_matches_project_score (project_id, match_score),
  INDEX idx_t_matches_engineer (engineer_id),
  INDEX idx_t_matches_status (status),
  CONSTRAINT fk_t_matches_project FOREIGN KEY (project_id) REFERENCES t_projects (project_id),
  CONSTRAINT fk_t_matches_engineer FOREIGN KEY (engineer_id) REFERENCES m_engineers (engineer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_proposals (
  id VARCHAR(36) NOT NULL,
  project_id VARCHAR(36) NOT NULL,
  engineer_id VARCHAR(36) NOT NULL,
  match_id VARCHAR(36) NULL,
  customer_id VARCHAR(36) NOT NULL,
  contact_id VARCHAR(36) NULL,
  resume_id VARCHAR(36) NULL,
  proposed_unit_price DECIMAL(12,2) NULL,
  proposed_at DATETIME NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'proposed',
  next_action_at DATETIME NULL,
  owner_user_id VARCHAR(36) NULL,
  lost_reason VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  INDEX idx_t_proposals_project (project_id),
  INDEX idx_t_proposals_engineer (engineer_id),
  INDEX idx_t_proposals_status (status),
  INDEX idx_t_proposals_owner_next_action (owner_user_id, next_action_at),
  CONSTRAINT fk_t_proposals_project FOREIGN KEY (project_id) REFERENCES t_projects (project_id),
  CONSTRAINT fk_t_proposals_engineer FOREIGN KEY (engineer_id) REFERENCES m_engineers (engineer_id),
  CONSTRAINT fk_t_proposals_match FOREIGN KEY (match_id) REFERENCES t_project_engineer_matches (id),
  CONSTRAINT fk_t_proposals_customer FOREIGN KEY (customer_id) REFERENCES m_customers (id),
  CONSTRAINT fk_t_proposals_contact FOREIGN KEY (contact_id) REFERENCES m_customer_contacts (id),
  CONSTRAINT fk_t_proposals_resume FOREIGN KEY (resume_id) REFERENCES t_resumes (id),
  CONSTRAINT fk_t_proposals_owner FOREIGN KEY (owner_user_id) REFERENCES m_users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_proposal_activities (
  id VARCHAR(36) NOT NULL,
  proposal_id VARCHAR(36) NOT NULL,
  activity_type VARCHAR(32) NOT NULL,
  activity_at DATETIME NOT NULL,
  subject VARCHAR(255) NULL,
  content TEXT NULL,
  old_status VARCHAR(32) NULL,
  new_status VARCHAR(32) NULL,
  created_by VARCHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_t_proposal_activities_proposal (proposal_id, activity_at),
  INDEX idx_t_proposal_activities_type (activity_type),
  CONSTRAINT fk_t_proposal_activities_proposal FOREIGN KEY (proposal_id) REFERENCES t_proposals (id),
  CONSTRAINT fk_t_proposal_activities_user FOREIGN KEY (created_by) REFERENCES m_users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_contracts (
  id VARCHAR(36) NOT NULL,
  contract_no VARCHAR(50) NOT NULL,
  proposal_id VARCHAR(36) NULL,
  project_id VARCHAR(36) NOT NULL,
  engineer_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  partner_customer_id VARCHAR(36) NULL,
  contract_type VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renewal TINYINT(1) NOT NULL DEFAULT 0,
  owner_user_id VARCHAR(36) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_t_contracts_no (contract_no),
  INDEX idx_t_contracts_project (project_id),
  INDEX idx_t_contracts_engineer (engineer_id),
  INDEX idx_t_contracts_customer (customer_id),
  INDEX idx_t_contracts_period (start_date, end_date),
  INDEX idx_t_contracts_status (status),
  CONSTRAINT fk_t_contracts_proposal FOREIGN KEY (proposal_id) REFERENCES t_proposals (id),
  CONSTRAINT fk_t_contracts_project FOREIGN KEY (project_id) REFERENCES t_projects (project_id),
  CONSTRAINT fk_t_contracts_engineer FOREIGN KEY (engineer_id) REFERENCES m_engineers (engineer_id),
  CONSTRAINT fk_t_contracts_customer FOREIGN KEY (customer_id) REFERENCES m_customers (id),
  CONSTRAINT fk_t_contracts_partner FOREIGN KEY (partner_customer_id) REFERENCES m_customers (id),
  CONSTRAINT fk_t_contracts_owner FOREIGN KEY (owner_user_id) REFERENCES m_users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_contract_terms (
  id VARCHAR(36) NOT NULL,
  contract_id VARCHAR(36) NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  sales_unit_price DECIMAL(12,2) NOT NULL,
  cost_unit_price DECIMAL(12,2) NOT NULL,
  billing_unit VARCHAR(32) NOT NULL DEFAULT 'monthly',
  lower_work_hours DECIMAL(6,2) NULL,
  upper_work_hours DECIMAL(6,2) NULL,
  overtime_rate DECIMAL(12,2) NULL,
  deduction_rate DECIMAL(12,2) NULL,
  payment_site VARCHAR(50) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_t_contract_terms_contract_period (contract_id, valid_from, valid_to),
  CONSTRAINT fk_t_contract_terms_contract FOREIGN KEY (contract_id) REFERENCES t_contracts (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_billing_items (
  id VARCHAR(36) NOT NULL,
  contract_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  engineer_id VARCHAR(36) NOT NULL,
  target_month CHAR(7) NOT NULL,
  work_hours DECIMAL(6,2) NULL,
  sales_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  gross_profit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  gross_profit_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  billing_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  invoice_document_id VARCHAR(36) NULL,
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_t_billing_items_contract_month (contract_id, target_month),
  INDEX idx_t_billing_items_month (target_month),
  INDEX idx_t_billing_items_customer_month (customer_id, target_month),
  INDEX idx_t_billing_items_status (billing_status),
  CONSTRAINT fk_t_billing_items_contract FOREIGN KEY (contract_id) REFERENCES t_contracts (id),
  CONSTRAINT fk_t_billing_items_customer FOREIGN KEY (customer_id) REFERENCES m_customers (id),
  CONSTRAINT fk_t_billing_items_engineer FOREIGN KEY (engineer_id) REFERENCES m_engineers (engineer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE m_document_templates (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  document_type VARCHAR(32) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  version INT NOT NULL DEFAULT 1,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  INDEX idx_m_document_templates_type (document_type, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_documents (
  id VARCHAR(36) NOT NULL,
  document_no VARCHAR(50) NOT NULL,
  document_type VARCHAR(32) NOT NULL,
  template_id VARCHAR(36) NULL,
  customer_id VARCHAR(36) NULL,
  project_id VARCHAR(36) NULL,
  engineer_id VARCHAR(36) NULL,
  contract_id VARCHAR(36) NULL,
  billing_item_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NULL,
  amount DECIMAL(12,2) NULL,
  issue_date DATE NULL,
  due_date DATE NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'draft',
  created_by VARCHAR(36) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_t_documents_no (document_no),
  INDEX idx_t_documents_contract (contract_id),
  INDEX idx_t_documents_type_status (document_type, status),
  INDEX idx_t_documents_issue_date (issue_date),
  CONSTRAINT fk_t_documents_template FOREIGN KEY (template_id) REFERENCES m_document_templates (id),
  CONSTRAINT fk_t_documents_customer FOREIGN KEY (customer_id) REFERENCES m_customers (id),
  CONSTRAINT fk_t_documents_project FOREIGN KEY (project_id) REFERENCES t_projects (project_id),
  CONSTRAINT fk_t_documents_engineer FOREIGN KEY (engineer_id) REFERENCES m_engineers (engineer_id),
  CONSTRAINT fk_t_documents_contract FOREIGN KEY (contract_id) REFERENCES t_contracts (id),
  CONSTRAINT fk_t_documents_billing_item FOREIGN KEY (billing_item_id) REFERENCES t_billing_items (id),
  CONSTRAINT fk_t_documents_user FOREIGN KEY (created_by) REFERENCES m_users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE t_monthly_sales (
  id VARCHAR(36) NOT NULL,
  target_month CHAR(7) NOT NULL,
  customer_id VARCHAR(36) NULL,
  owner_user_id VARCHAR(36) NULL,
  sales_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  gross_profit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  gross_profit_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  active_engineer_count INT NOT NULL DEFAULT 0,
  waiting_engineer_count INT NOT NULL DEFAULT 0,
  utilization_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_t_monthly_sales_scope (target_month, customer_id, owner_user_id),
  INDEX idx_t_monthly_sales_month (target_month),
  CONSTRAINT fk_t_monthly_sales_customer FOREIGN KEY (customer_id) REFERENCES m_customers (id),
  CONSTRAINT fk_t_monthly_sales_owner FOREIGN KEY (owner_user_id) REFERENCES m_users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO m_codes (code_type, code, code_value, display_order, is_active, created_by, updated_by) VALUES
('ROLE', 'president', '社長', 10, TRUE, 'system', 'system'),
('ROLE', 'executive', '管理層', 20, TRUE, 'system', 'system'),
('ROLE', 'sales', '営業', 30, TRUE, 'system', 'system'),
('ROLE', 'backoffice', '管理部、バックオフィス', 40, TRUE, 'system', 'system'),
('ROLE', 'accounting', '会計・財務', 50, TRUE, 'system', 'system'),
('ROLE', 'employee', '一般社員', 60, TRUE, 'system', 'system'),
('ROLE', 'system_admin', 'システム管理者', 70, TRUE, 'system', 'system'),
('CUSTOMER_TYPE', 'end_client', 'エンドクライアント', 10, TRUE, 'system', 'system'),
('CUSTOMER_TYPE', 'prime_vendor', '元請・一次請け', 20, TRUE, 'system', 'system'),
('CUSTOMER_TYPE', 'partner', '協力会社、パートナー', 30, TRUE, 'system', 'system'),
('CUSTOMER_TYPE', 'other', 'その他', 999, TRUE, 'system', 'system'),
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
('ASSIGNMENT_STATUS', 'ENDED', '終了', 30, TRUE, 'system', 'system'),
('PROJECT_STATUS', 'open', '募集中・オープン', 10, TRUE, 'system', 'system'),
('PROJECT_STATUS', 'proposing', '提案中', 20, TRUE, 'system', 'system'),
('PROJECT_STATUS', 'contracted', '成約済み・契約済み', 30, TRUE, 'system', 'system'),
('PROJECT_STATUS', 'closed', 'クローズ済み', 40, TRUE, 'system', 'system'),
('PROJECT_STATUS', 'lost', '失注・未成約', 50, TRUE, 'system', 'system'),
('ENGINEER_STATUS', 'waiting', '待機中', 10, TRUE, 'system', 'system'),
('ENGINEER_STATUS', 'proposing', '提案中', 20, TRUE, 'system', 'system'),
('ENGINEER_STATUS', 'working', '稼働中・参画中', 30, TRUE, 'system', 'system'),
('ENGINEER_STATUS', 'unavailable', '提案不可・稼働不可', 40, TRUE, 'system', 'system'),
('REMOTE_TYPE', 'onsite', '常駐・オンサイト', 10, TRUE, 'system', 'system'),
('REMOTE_TYPE', 'hybrid', 'ハイブリッド勤務', 20, TRUE, 'system', 'system'),
('REMOTE_TYPE', 'remote', 'リモート勤務', 30, TRUE, 'system', 'system'),
('REQUIREMENT_LEVEL', 'must', '必須', 10, TRUE, 'system', 'system'),
('REQUIREMENT_LEVEL', 'should', '推奨・あると望ましい', 20, TRUE, 'system', 'system'),
('REQUIREMENT_LEVEL', 'nice', '加点項目', 30, TRUE, 'system', 'system'),
('SKILL_LEVEL', 'beginner', '初級', 10, TRUE, 'system', 'system'),
('SKILL_LEVEL', 'intermediate', '中級', 20, TRUE, 'system', 'system'),
('SKILL_LEVEL', 'advanced', '上級', 30, TRUE, 'system', 'system'),
('SKILL_LEVEL', 'expert', 'エキスパート', 40, TRUE, 'system', 'system'),
('BILLING_UNIT', 'monthly', '月額', 10, TRUE, 'system', 'system'),
('BILLING_UNIT', 'hourly', '時間単位', 20, TRUE, 'system', 'system'),
('BILLING_UNIT', 'daily', '日単位', 30, TRUE, 'system', 'system'),
('DOCUMENT_TYPE', 'estimate', '見積書', 10, TRUE, 'system', 'system'),
('DOCUMENT_TYPE', 'order', '注文書', 20, TRUE, 'system', 'system'),
('DOCUMENT_TYPE', 'order_ack', '注文請書', 30, TRUE, 'system', 'system'),
('DOCUMENT_TYPE', 'invoice', '請求書', 40, TRUE, 'system', 'system'),
('DOCUMENT_TYPE', 'contract', '契約書', 50, TRUE, 'system', 'system'),
('DOCUMENT_TYPE', 'proposal', '提案資料', 60, TRUE, 'system', 'system'),
('BILLING_STATUS', 'pending', '請求待ち', 10, TRUE, 'system', 'system'),
('BILLING_STATUS', 'invoiced', '請求済み・請求書発行済み', 20, TRUE, 'system', 'system'),
('BILLING_STATUS', 'paid', '入金済み', 30, TRUE, 'system', 'system'),
('BILLING_STATUS', 'cancelled', '取消済み', 40, TRUE, 'system', 'system');
