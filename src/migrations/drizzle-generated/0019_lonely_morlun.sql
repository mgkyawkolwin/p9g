CREATE TABLE `prepaidPackage` (
	`id` char(36) NOT NULL,
	`customerId` char(36) NOT NULL,
	`effectiveStartDate` datetime(3) NOT NULL,
	`effectiveEndDate` datetime(3) NOT NULL,
	`noOfDays` smallint NOT NULL,
	`price` decimal NOT NULL DEFAULT '0',
	`deposit` decimal NOT NULL DEFAULT '0',
	`balance` decimal NOT NULL DEFAULT '0',
	`depositDateTimeUTC` datetime(3),
	`location` varchar(10) NOT NULL,
	`remark` varchar(500),
	`prepaidPackageTypeId` char(36) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `prepaidPackage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `reservation` MODIFY COLUMN `prepaidCode` char(36);--> statement-breakpoint
ALTER TABLE `prepaidPackage` ADD CONSTRAINT `prepaidPackage_customerId_customer_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `prepaidPackage` ADD CONSTRAINT `prepaidPackage_prepaidPackageTypeId_prepaid_id_fk` FOREIGN KEY (`prepaidPackageTypeId`) REFERENCES `prepaid`(`id`) ON DELETE no action ON UPDATE no action;