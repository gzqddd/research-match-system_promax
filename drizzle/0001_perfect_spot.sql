CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`project_id` int NOT NULL,
	`student_id` int NOT NULL,
	`statement` text,
	`status` enum('submitted','screening_passed','interview_scheduled','accepted','rejected') NOT NULL DEFAULT 'submitted',
	`teacher_feedback` text,
	`match_score` int,
	`match_analysis` text,
	`interview_time` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `internship_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`application_id` int NOT NULL,
	`stage` enum('literature_review','code_reproduction','experiment_improvement','completed') NOT NULL DEFAULT 'literature_review',
	`weekly_reports` text,
	`stage_evaluations` text,
	`final_score` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `internship_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `match_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`project_id` int NOT NULL,
	`match_score` int NOT NULL,
	`match_details` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `match_cache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`related_id` int,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacher_id` int NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`department` varchar(100),
	`research_field` varchar(100),
	`requirements` text,
	`required_skills` text,
	`duration` varchar(50),
	`start_date` timestamp,
	`end_date` timestamp,
	`recruit_count` int DEFAULT 1,
	`current_count` int DEFAULT 0,
	`status` enum('draft','published','closed') NOT NULL DEFAULT 'draft',
	`view_count` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`student_id` varchar(50),
	`grade` varchar(20),
	`major` varchar(100),
	`gpa` varchar(10),
	`resume_url` text,
	`resume_key` text,
	`skills` text,
	`research_interests` text,
	`project_experience` text,
	`available_time` varchar(50),
	`status` enum('idle','internship') NOT NULL DEFAULT 'idle',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`active_students` int DEFAULT 0,
	`active_teachers` int DEFAULT 0,
	`new_applications` int DEFAULT 0,
	`match_success_rate` int DEFAULT 0,
	`api_token_usage` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teacher_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`employee_id` varchar(50),
	`title` varchar(100),
	`department` varchar(100),
	`research_direction` text,
	`achievements` text,
	`avatar_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teacher_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('student','teacher','admin') NOT NULL DEFAULT 'student';--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `applications` ADD CONSTRAINT `applications_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `internship_progress` ADD CONSTRAINT `internship_progress_application_id_applications_id_fk` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `match_cache` ADD CONSTRAINT `match_cache_student_id_users_id_fk` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `match_cache` ADD CONSTRAINT `match_cache_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_teacher_id_users_id_fk` FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teacher_profiles` ADD CONSTRAINT `teacher_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `project_idx` ON `applications` (`project_id`);--> statement-breakpoint
CREATE INDEX `student_idx` ON `applications` (`student_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `applications` (`status`);--> statement-breakpoint
CREATE INDEX `application_idx` ON `internship_progress` (`application_id`);--> statement-breakpoint
CREATE INDEX `student_project_idx` ON `match_cache` (`student_id`,`project_id`);--> statement-breakpoint
CREATE INDEX `expires_idx` ON `match_cache` (`expires_at`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `read_idx` ON `notifications` (`is_read`);--> statement-breakpoint
CREATE INDEX `teacher_idx` ON `projects` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `projects` (`status`);--> statement-breakpoint
CREATE INDEX `field_idx` ON `projects` (`research_field`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `student_profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `student_profiles` (`status`);--> statement-breakpoint
CREATE INDEX `date_idx` ON `system_stats` (`date`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `teacher_profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);