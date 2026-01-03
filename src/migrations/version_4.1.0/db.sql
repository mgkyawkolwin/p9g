CREATE TABLE `feedback` (
	`id` char(36) NOT NULL,
	`reservationId` char(36) NOT NULL,
	`customerId` char(36),
	`feedback` text,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` char(36) NOT NULL,
	`reservationId` char(36) NOT NULL,
	`customerId` char(36),
	`url` varchar(500) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `version` (
	`id` char(36) NOT NULL,
	`version` varchar(10) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `version_id` PRIMARY KEY(`id`)
);

INSERT INTO version VALUES(uuid(), '4.1.0', now(), '00000000-0000-0000-0000-000000000000', now(), '00000000-0000-0000-0000-000000000000');
--> statement-breakpoint
ALTER TABLE `reservationCustomer` ADD `tdacFileUrl` varchar(50);--> statement-breakpoint
ALTER TABLE `reservation` ADD `golfCart` varchar(20);--> statement-breakpoint
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_reservationId_reservation_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_customerId_customer_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_reservationId_reservation_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_customerId_customer_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE restrict ON UPDATE no action;