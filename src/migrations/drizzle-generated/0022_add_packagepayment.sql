CREATE TABLE `packagepayment` (
	`id` char(36) NOT NULL,
	`prepaidPackageId` char(36) NOT NULL,
	`amount` decimal NOT NULL,
	`paymentDateTimeUTC` datetime(3) NOT NULL,
	`currency` char(3) NOT NULL,
	`remark` varchar(500),
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `packagepayment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `prepaidPackage` ADD `daysUsed` smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `packagepayment` ADD CONSTRAINT `packagepayment_prepaidPackageId_prepaidPackage_id_fk` FOREIGN KEY (`prepaidPackageId`) REFERENCES `prepaidPackage`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint