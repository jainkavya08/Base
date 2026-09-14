-- Database structure for Base App
-- Note: Do NOT use CREATE DATABASE or USE. Import this directly into the existing InfinityFree database via phpMyAdmin.

-- 1. Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_login_at` DATETIME NULL,
  `is_active` BOOLEAN DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Todo Files
CREATE TABLE IF NOT EXISTS `files` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_files_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Todo Lists
CREATE TABLE IF NOT EXISTS `todo_lists` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `file_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `default_view` ENUM('list', 'board', 'compact') DEFAULT 'list',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`file_id`) REFERENCES `files`(`id`) ON DELETE CASCADE,
  INDEX `idx_todolists_user_id` (`user_id`),
  INDEX `idx_todolists_file_id` (`file_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tasks (Todos and Subtasks)
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `list_id` VARCHAR(36) NOT NULL,
  `parent_task_id` VARCHAR(36) NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `completed` BOOLEAN DEFAULT 0,
  `due_date` DATE NULL,
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `status` VARCHAR(50) NULL,
  `position` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`list_id`) REFERENCES `todo_lists`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_task_id`) REFERENCES `tasks`(`id`) ON DELETE CASCADE,
  INDEX `idx_tasks_user_id` (`user_id`),
  INDEX `idx_tasks_user_list` (`user_id`, `list_id`),
  INDEX `idx_tasks_user_due` (`user_id`, `due_date`),
  INDEX `idx_tasks_parent_id` (`parent_task_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Habits
CREATE TABLE IF NOT EXISTS `habits` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `type` ENUM('daily', 'weekly', 'numeric', 'duration', 'avoid') NOT NULL,
  `description` TEXT NULL,
  `active_days` JSON NULL,
  `target` INT NULL,
  `unit` VARCHAR(50) NULL,
  `icon` VARCHAR(50) NULL,
  `color` VARCHAR(50) NULL,
  `reminder_time` VARCHAR(20) NULL,
  `paused` BOOLEAN DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_habits_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Habit Completions
CREATE TABLE IF NOT EXISTS `habit_completions` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `habit_id` VARCHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `value` INT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_user_habit_date` (`user_id`, `habit_id`, `date`),
  INDEX `idx_habitcompletions_user_habit` (`user_id`, `habit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Pomodoro Sessions
CREATE TABLE IF NOT EXISTS `pomodoro_sessions` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `task_id` VARCHAR(36) NULL,
  `duration_minutes` INT NOT NULL,
  `completed_at` DATETIME NOT NULL,
  `type` ENUM('focus', 'short_break', 'long_break') DEFAULT 'focus',
  `status` ENUM('completed', 'interrupted', 'skipped') DEFAULT 'completed',
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON DELETE SET NULL,
  INDEX `idx_pomodoro_user_id` (`user_id`),
  INDEX `idx_pomodoro_user_completed` (`user_id`, `completed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Pomodoro Settings
CREATE TABLE IF NOT EXISTS `pomodoro_settings` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `focus_duration` INT DEFAULT 25,
  `short_break_duration` INT DEFAULT 5,
  `long_break_duration` INT DEFAULT 15,
  `auto_start_break` BOOLEAN DEFAULT 0,
  `auto_start_focus` BOOLEAN DEFAULT 0,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_pomodoro_settings_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Reminders
CREATE TABLE IF NOT EXISTS `reminders` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `fire_at` DATETIME NOT NULL,
  `is_completed` BOOLEAN DEFAULT 0,
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `repeat_type` ENUM('none', 'daily', 'weekly', 'monthly', 'yearly') DEFAULT 'none',
  `repeat_interval` INT DEFAULT 1,
  `repeat_until` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_reminders_user_id` (`user_id`),
  INDEX `idx_reminders_user_fire` (`user_id`, `fire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Bank Accounts
CREATE TABLE IF NOT EXISTS `bank_accounts` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `bank_name` VARCHAR(100) NOT NULL,
  `account_type` VARCHAR(50) NOT NULL,
  `account_number_last_4` VARCHAR(4) NULL,
  `opening_balance` DECIMAL(15, 2) DEFAULT 0.00,
  `currency` VARCHAR(10) DEFAULT 'INR',
  `color` VARCHAR(50) NULL,
  `logo` MEDIUMTEXT NULL,
  `is_active` BOOLEAN DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_bankaccounts_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Finance Categories
CREATE TABLE IF NOT EXISTS `finance_categories` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('income', 'expense') NOT NULL,
  `icon` VARCHAR(50) NULL,
  `color` VARCHAR(50) NULL,
  `is_default` BOOLEAN DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_categories_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Recurring Payments
CREATE TABLE IF NOT EXISTS `recurring_payments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `account_id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NULL,
  `name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `frequency` ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
  `start_date` DATE NOT NULL,
  `next_due_date` DATE NOT NULL,
  `end_date` DATE NULL,
  `is_active` BOOLEAN DEFAULT 1,
  `notes` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`category_id`) REFERENCES `finance_categories`(`id`) ON DELETE SET NULL,
  INDEX `idx_recurring_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Transactions
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `account_id` VARCHAR(36) NOT NULL,
  `category_id` VARCHAR(36) NULL,
  `type` ENUM('income', 'expense') NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `title` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `date` DATE NOT NULL,
  `notes` TEXT NULL,
  `recurring_payment_id` VARCHAR(36) NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`category_id`) REFERENCES `finance_categories`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`recurring_payment_id`) REFERENCES `recurring_payments`(`id`) ON DELETE SET NULL,
  INDEX `idx_transactions_user_account` (`user_id`, `account_id`),
  INDEX `idx_transactions_user_date` (`user_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Transfers
CREATE TABLE IF NOT EXISTS `transfers` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `from_account_id` VARCHAR(36) NOT NULL,
  `to_account_id` VARCHAR(36) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `date` DATE NOT NULL,
  `description` TEXT NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`from_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`to_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE RESTRICT,
  INDEX `idx_transfers_user_date` (`user_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Investments
CREATE TABLE IF NOT EXISTS `investments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('Stocks', 'Mutual Funds', 'ETFs', 'Fixed Deposits', 'Gold', 'Bonds', 'Crypto', 'PPF', 'NPS', 'Other') NOT NULL,
  `platform` VARCHAR(100) NULL,
  `symbol` VARCHAR(50) NULL,
  `quantity` DECIMAL(15, 4) NULL,
  `invested_amount` DECIMAL(15, 2) NOT NULL,
  `current_value` DECIMAL(15, 2) NOT NULL,
  `purchase_date` DATE NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_investments_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Debts
CREATE TABLE IF NOT EXISTS `debts` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `type` ENUM('owed_by_you', 'owed_to_you') NOT NULL,
  `person_or_organization` VARCHAR(255) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `original_amount` DECIMAL(15, 2) NOT NULL,
  `remaining_amount` DECIMAL(15, 2) NOT NULL,
  `due_date` DATE NULL,
  `interest_rate` DECIMAL(5, 2) NULL,
  `status` ENUM('outstanding', 'partially_paid', 'paid', 'overdue') DEFAULT 'outstanding',
  `notes` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_debts_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Debt Payments
CREATE TABLE IF NOT EXISTS `debt_payments` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `debt_id` VARCHAR(36) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `payment_date` DATE NOT NULL,
  `notes` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`debt_id`) REFERENCES `debts`(`id`) ON DELETE CASCADE,
  INDEX `idx_debtpayments_user_debt` (`user_id`, `debt_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
