CREATE TABLE `reservation_log` (
	`log_Id` bigint AUTO_INCREMENT NOT NULL DEFAULT 1,
	`id` char(36) NOT NULL,
	`reservationTypeId` char(36) NOT NULL,
	`invoiceStatusId` char(36) NOT NULL,
	`invoiceNumber` varchar(10),
	`tourCompany` varchar(100),
	`arrivalDateTime` datetime,
	`arrivalFlight` varchar(50),
	`bookingSource` varchar(50),
	`departureDateTime` datetime,
	`departureFlight` varchar(50),
	`checkInDate` datetime,
	`checkOutDate` datetime,
	`noOfDays` smallint,
	`depositAmount` int,
	`depositAmountInCurrency` int,
	`depositCurrency` char(3),
	`depositDateUTC` date,
	`depositPaymentMode` varchar(10),
	`roomNo` varchar(10),
	`isSingleOccupancy` boolean,
	`noOfGuests` tinyint,
	`pickUpTypeId` char(36),
	`pickUpFee` tinyint,
	`pickUpFeeCurrency` char(3),
	`pickUpFeePaidOnUTC` datetime,
	`pickUpCarNo` varchar(10),
	`pickUpDriver` varchar(50),
	`prepaidCode` char(8),
	`prepaidPackageId` char(36),
	`promotionPackageId` char(36),
	`dropOffTypeId` char(36),
	`dropOffFee` tinyint,
	`dropOffFeeCurrency` char(3),
	`dropOffFeePaidOnUTC` datetime,
	`dropOffCarNo` varchar(10),
	`dropOffDriver` varchar(50),
	`reservationStatusId` char(36) NOT NULL,
	`remark` varchar(500),
	`paymentRemark` varchar(500),
	`totalAmount` decimal,
	`paidAmount` decimal,
	`discountAmount` decimal,
	`tax` decimal,
	`taxAmount` decimal,
	`netAmount` decimal,
	`dueAmount` decimal,
	`golfCart` varchar(20),
	`location` varchar(10) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	`trigger` enum('INSERT','UPDATE','DELETE') NOT NULL,
	`triggerDateTimeUTC` datetime(3) NOT NULL,
	CONSTRAINT `reservation_log_log_Id` PRIMARY KEY(`log_Id`)
);
--> statement-breakpoint
CREATE TABLE `roomCharge_log` (
	`log_Id` bigint AUTO_INCREMENT NOT NULL DEFAULT 1,
	`id` char(36) NOT NULL,
	`reservationId` char(36) NOT NULL,
	`startDate` datetime,
	`endDate` datetime,
	`roomId` char,
	`roomTypeId` char(36) NOT NULL,
	`roomRate` decimal NOT NULL,
	`roomSurcharge` decimal NOT NULL,
	`singleRate` decimal NOT NULL,
	`seasonSurcharge` decimal NOT NULL,
	`extraBedRate` decimal NOT NULL,
	`totalRate` decimal NOT NULL,
	`noOfDays` tinyint NOT NULL,
	`totalAmount` decimal NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	`trigger` enum('INSERT','UPDATE','DELETE') NOT NULL,
	`triggerDateTimeUTC` datetime(3) NOT NULL,
	CONSTRAINT `roomCharge_log_log_Id` PRIMARY KEY(`log_Id`)
);
--> statement-breakpoint
ALTER TABLE `reservation` MODIFY COLUMN `reservationTypeId` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `media` ADD `mediaGroupId` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationCustomer` ADD `tdacStatusId` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `reservation` ADD `invoiceStatusId` char(36) NOT NULL;--> statement-breakpoint
ALTER TABLE `reservation` ADD `invoiceNumber` varchar(10);--> statement-breakpoint
ALTER TABLE `room` ADD `zone` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `room` ADD `bedType` varchar(10) NOT NULL;--> statement-breakpoint
ALTER TABLE `reservation_log` ADD CONSTRAINT `reservation_log_reservationTypeId_config_id_fk` FOREIGN KEY (`reservationTypeId`) REFERENCES `config`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation_log` ADD CONSTRAINT `reservation_log_invoiceStatusId_config_id_fk` FOREIGN KEY (`invoiceStatusId`) REFERENCES `config`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation_log` ADD CONSTRAINT `reservation_log_pickUpTypeId_config_id_fk` FOREIGN KEY (`pickUpTypeId`) REFERENCES `config`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation_log` ADD CONSTRAINT `reservation_log_prepaidPackageId_prepaid_id_fk` FOREIGN KEY (`prepaidPackageId`) REFERENCES `prepaid`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation_log` ADD CONSTRAINT `reservation_log_promotionPackageId_promotion_id_fk` FOREIGN KEY (`promotionPackageId`) REFERENCES `promotion`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation_log` ADD CONSTRAINT `reservation_log_dropOffTypeId_config_id_fk` FOREIGN KEY (`dropOffTypeId`) REFERENCES `config`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation_log` ADD CONSTRAINT `reservation_log_reservationStatusId_config_id_fk` FOREIGN KEY (`reservationStatusId`) REFERENCES `config`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roomCharge_log` ADD CONSTRAINT `roomCharge_log_reservationId_reservation_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_mediaGroupId_config_id_fk` FOREIGN KEY (`mediaGroupId`) REFERENCES `config`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservationCustomer` ADD CONSTRAINT `reservationCustomer_tdacStatusId_config_id_fk` FOREIGN KEY (`tdacStatusId`) REFERENCES `config`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_invoiceStatusId_config_id_fk` FOREIGN KEY (`invoiceStatusId`) REFERENCES `config`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservationCustomer` DROP COLUMN `tdacFileUrl`;