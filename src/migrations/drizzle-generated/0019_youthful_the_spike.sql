CREATE TABLE `packagePayment` (
	`id` char(36) NOT NULL,
	`prepaidPackageId` char(36) NOT NULL,
	`amount` decimal NOT NULL,
	`paymentDateTimeUTC` datetime(3) NOT NULL,
	`currency` char(3) NOT NULL,
	`paymentMode` varchar(10) NOT NULL DEFAULT 'CASH',
	`remark` varchar(500),
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `packagePayment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `packageUsage` (
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
	CONSTRAINT `packageUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prepaidPackage` (
	`id` char(36) NOT NULL,
	`customerId` char(36) NOT NULL,
	`effectiveStartDate` datetime(3) NOT NULL,
	`effectiveEndDate` datetime(3) NOT NULL,
	`noOfDays` smallint NOT NULL,
	`daysUsed` smallint NOT NULL DEFAULT 0,
	`packageStatus` varchar(10) NOT NULL DEFAULT 'New',
	`price` decimal NOT NULL DEFAULT '0',
	`paidAmount` decimal NOT NULL DEFAULT '0',
	`paymentStatus` varchar(10) NOT NULL DEFAULT 'Unpaid',
	`remark` varchar(500),
	`prepaidPackageTypeId` char(36) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `prepaidPackage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `prepaid` MODIFY COLUMN `days` smallint NOT NULL;--> statement-breakpoint
ALTER TABLE `reservation` MODIFY COLUMN `prepaidCode` char(36);--> statement-breakpoint
ALTER TABLE `packagePayment` ADD CONSTRAINT `packagePayment_prepaidPackageId_prepaidPackage_id_fk` FOREIGN KEY (`prepaidPackageId`) REFERENCES `prepaidPackage`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `packageUsage` ADD CONSTRAINT `packageUsage_reservationId_reservation_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `packageUsage` ADD CONSTRAINT `packageUsage_customerId_customer_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `packageUsage` ADD CONSTRAINT `packageUsage_prepaidPackageId_prepaidPackage_id_fk` FOREIGN KEY (`prepaidPackageId`) REFERENCES `prepaidPackage`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prepaidPackage` ADD CONSTRAINT `prepaidPackage_customerId_customer_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prepaidPackage` ADD CONSTRAINT `prepaidPackage_prepaidPackageTypeId_prepaid_id_fk` FOREIGN KEY (`prepaidPackageTypeId`) REFERENCES `prepaid`(`id`) ON DELETE no action ON UPDATE no action;