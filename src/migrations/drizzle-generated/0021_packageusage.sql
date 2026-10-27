CREATE TABLE `packageusage` (
	`id` char(36) NOT NULL,
	`reservationId` char(36) NOT NULL,
	`customerId` char(36) NOT NULL,
	`prepaidPackageId` char(36) NOT NULL,
	`startDate` datetime(3) NOT NULL,
	`endDate` datetime(3) NOT NULL,
	`days` smallint NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `packageusage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `packageusage` ADD CONSTRAINT `packageusage_reservationId_reservation_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `packageusage` ADD CONSTRAINT `packageusage_customerId_customer_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `packageusage` ADD CONSTRAINT `packageusage_prepaidPackageId_prepaidPackage_id_fk` FOREIGN KEY (`prepaidPackageId`) REFERENCES `prepaidPackage`(`id`) ON DELETE restrict ON UPDATE no action;