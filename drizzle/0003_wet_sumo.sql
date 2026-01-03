ALTER TABLE `internship_progress` MODIFY COLUMN `stage` enum('literature_review','code_reproduction','experiment_improvement','completed','onboarding','ongoing','paused') NOT NULL DEFAULT 'onboarding';--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `status` enum('draft','pending_review','published','rejected','closed') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('active','pending','banned') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notification_enabled` boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX `status_idx` ON `users` (`status`);