CREATE TABLE `task` (
	`id` char(36) NOT NULL,
	`reservationId` char(36),
	`customerId` char(36),
	`description` text NOT NULL,
	`department` varchar(50),
	`status` varchar(50) NOT NULL,
	`remark` varchar(255),
	`targetCompletionDateTime` datetime(3),
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `task_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `logError` MODIFY COLUMN `detail` varchar(500) NOT NULL;--> statement-breakpoint
ALTER TABLE `media` MODIFY COLUMN `reservationId` char(36);--> statement-breakpoint
ALTER TABLE `feedback` ADD `isTaskCreated` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `task` ADD CONSTRAINT `task_reservationId_reservation_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `task` ADD CONSTRAINT `task_customerId_customer_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE restrict ON UPDATE no action;