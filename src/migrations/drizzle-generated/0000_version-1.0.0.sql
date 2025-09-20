CREATE TABLE `bill` (
	`id` char(36) NOT NULL,
	`dateUTC` datetime,
	`paymentMode` varchar(10) NOT NULL,
	`paymentType` varchar(10) NOT NULL,
	`reservationId` char NOT NULL,
	`itemName` varchar(100) NOT NULL,
	`unitPrice` decimal NOT NULL,
	`quantity` tinyint NOT NULL,
	`amount` decimal NOT NULL,
	`isPaid` boolean NOT NULL DEFAULT false,
	`paidOnUTC` datetime,
	`currency` char(3),
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `bill_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `config` (
	`id` char(36) NOT NULL,
	`group` varchar(50) NOT NULL,
	`value` varchar(50) NOT NULL,
	`text` varchar(50) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer` (
	`id` char(36) NOT NULL,
	`name` varchar(255),
	`englishName` varchar(255) NOT NULL,
	`dob` date,
	`passport` varchar(50),
	`nationalId` varchar(50),
	`address` varchar(255),
	`country` varchar(50),
	`phone` varchar(50),
	`email` varchar(50),
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `customer_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_passport_unique` UNIQUE(`passport`),
	CONSTRAINT `customer_nationalId_unique` UNIQUE(`nationalId`),
	CONSTRAINT `customer_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `logError` (
	`id` char(36) NOT NULL,
	`userId` char(36),
	`datetime` datetime NOT NULL,
	`detail` decimal NOT NULL,
	CONSTRAINT `logError_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment` (
	`id` char(36) NOT NULL,
	`reservationId` char(36) NOT NULL,
	`paymentDateUTC` datetime NOT NULL,
	`paymentType` varchar(10) NOT NULL,
	`amount` decimal NOT NULL,
	`amountInCurrency` decimal NOT NULL,
	`currency` char(3) NOT NULL,
	`paymentMode` varchar(10) NOT NULL,
	`remark` varchar(200),
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `payment_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prepaid` (
	`id` char(36) NOT NULL,
	`value` varchar(50) NOT NULL,
	`text` varchar(50) NOT NULL,
	`days` tinyint NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `prepaid_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotion` (
	`id` char(36) NOT NULL,
	`value` varchar(50) NOT NULL,
	`text` varchar(50) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `promotion_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservationCustomer` (
	`id` char(36) NOT NULL,
	`reservationId` char(36) NOT NULL,
	`customerId` char(36) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `reservationCustomer_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation` (
	`id` char(36) NOT NULL,
	`reservationTypeId` char(36),
	`tourCompany` varchar(100),
	`arrivalDateTimeUTC` datetime,
	`arrivalFlight` varchar(50),
	`departureDateTimeUTC` datetime,
	`departureFlight` varchar(50),
	`checkInDateUTC` datetime,
	`checkOutDateUTC` datetime,
	`noOfDays` smallint,
	`depositAmount` int,
	`depositAmountInCurrency` int,
	`depositCurrency` char(3),
	`depositDateUTC` date,
	`roomNo` varchar(10),
	`isSingleOccupancy` boolean,
	`noOfGuests` tinyint,
	`pickUpTypeId` char(36),
	`pickUpFee` tinyint,
	`pickUpFeeCurrency` char(3),
	`pickUpFeePaidOnUTC` datetime,
	`pickUpCarNo` varchar(10),
	`pickUpDriver` varchar(50),
	`prepaidPackageId` char(36),
	`promotionPackageId` char(36),
	`dropOffTypeId` char(36),
	`dropOffFee` tinyint,
	`dropOffFeeCurrency` char(3),
	`dropOffFeePaidOnUTC` datetime,
	`dropOffCarNo` varchar(10),
	`dropOffDriver` varchar(50),
	`reservationStatusId` char(36) NOT NULL,
	`remark` varchar(255),
	`totalAmount` decimal,
	`paidAmount` decimal,
	`discountAmount` decimal,
	`tax` decimal,
	`taxAmount` decimal,
	`netAmount` decimal,
	`dueAmount` decimal,
	`location` varchar(10) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `reservation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roomCharge` (
	`id` char(36) NOT NULL,
	`reservationId` char(36),
	`startDateUTC` datetime,
	`endDateUTC` datetime,
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
	CONSTRAINT `roomCharge_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roomRate` (
	`id` char(36) NOT NULL,
	`roomTypeId` char(36) NOT NULL,
	`roomRate` decimal NOT NULL,
	`singleRate` decimal NOT NULL,
	`roomSurcharge` decimal NOT NULL,
	`seasonSurcharge` decimal NOT NULL,
	`extraBedRate` decimal NOT NULL,
	`month` tinyint NOT NULL,
	`location` varchar(10) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `roomRate_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roomReservation` (
	`id` char(36) NOT NULL,
	`roomId` char(36) NOT NULL,
	`reservationId` char(36) NOT NULL,
	`noOfExtraBed` tinyint DEFAULT 0,
	`checkInDateUTC` datetime(3) NOT NULL,
	`checkOutDateUTC` datetime(3) NOT NULL,
	`isSingleOccupancy` binary,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `roomReservation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `room` (
	`id` char(36) NOT NULL,
	`roomNo` varchar(50) NOT NULL,
	`roomTypeId` char(36) NOT NULL,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`location` varchar(10),
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `room_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roomType` (
	`id` char(36) NOT NULL,
	`roomType` varchar(50) NOT NULL,
	`roomTypeText` varchar(50) NOT NULL,
	`maxOccupancy` tinyint,
	`isDoubleBed` binary,
	`location` varchar(10),
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `roomType_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`userName` varchar(255) NOT NULL,
	`email` varchar(255),
	`password` varchar(100) NOT NULL,
	`role` varchar(50) NOT NULL,
	`location` varchar(10) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_userName_unique` UNIQUE(`userName`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `reservationCustomer` ADD CONSTRAINT `reservationCustomer_reservationId_reservation_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservationCustomer` ADD CONSTRAINT `reservationCustomer_customerId_customer_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_reservationTypeId_config_id_fk` FOREIGN KEY (`reservationTypeId`) REFERENCES `config`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_pickUpTypeId_config_id_fk` FOREIGN KEY (`pickUpTypeId`) REFERENCES `config`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_prepaidPackageId_prepaid_id_fk` FOREIGN KEY (`prepaidPackageId`) REFERENCES `prepaid`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_promotionPackageId_promotion_id_fk` FOREIGN KEY (`promotionPackageId`) REFERENCES `promotion`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_dropOffTypeId_config_id_fk` FOREIGN KEY (`dropOffTypeId`) REFERENCES `config`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_reservationStatusId_config_id_fk` FOREIGN KEY (`reservationStatusId`) REFERENCES `config`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roomReservation` ADD CONSTRAINT `roomReservation_roomId_room_id_fk` FOREIGN KEY (`roomId`) REFERENCES `room`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roomReservation` ADD CONSTRAINT `roomReservation_reservationId_reservation_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `room` ADD CONSTRAINT `room_roomNo_roomType_id_fk` FOREIGN KEY (`roomNo`) REFERENCES `roomType`(`id`) ON DELETE no action ON UPDATE no action;