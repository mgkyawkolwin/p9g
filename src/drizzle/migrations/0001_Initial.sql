CREATE TABLE `config` (
	`id` char(36) NOT NULL,
	`group` varchar(50) NOT NULL,
	`value` varchar(50) NOT NULL,
	`text` varchar(50) NOT NULL,
	`createdAt` timestamp(3),
	`createdBy` char(36) NOT NULL,
	`updatedAt` timestamp(3),
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer` (
	`id` char(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`dob` date,
	`passport` varchar(50),
	`nationalId` varchar(50),
	`address` varchar(255),
	`country` varchar(50),
	`phone` varchar(50),
	`email` varchar(50),
	`createdAt` timestamp(3),
	`createdBy` char(36) NOT NULL,
	`updatedAt` timestamp(3),
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `customer_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_passport_unique` UNIQUE(`passport`),
	CONSTRAINT `customer_nationalId_unique` UNIQUE(`nationalId`),
	CONSTRAINT `customer_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `prepaid` (
	`id` char(36) NOT NULL,
	`value` varchar(50) NOT NULL,
	`text` varchar(50) NOT NULL,
	`createdAt` timestamp(3),
	`createdBy` char(36) NOT NULL,
	`updatedAt` timestamp(3),
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `prepaid_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotion` (
	`id` char(36) NOT NULL,
	`value` varchar(50) NOT NULL,
	`text` varchar(50) NOT NULL,
	`createdAt` timestamp(3),
	`createdBy` char(36) NOT NULL,
	`updatedAt` timestamp(3),
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `promotion_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservation` (
	`id` char(36) NOT NULL,
	`reservationTypeId` char(36) NOT NULL,
	`arrivalDateTime` datetime,
	`arrivalFlight` varchar(50),
	`depertureDateTime` datetime,
	`depertureFlight` varchar(50),
	`checkInDate` date,
	`checkOutDate` date,
	`noOfDays` tinyint,
	`depositAmount` int,
	`depositCurrency` char(3),
	`roomNo` varchar(10),
	`pickUpTypeId` char(36),
	`pickUpFee` tinyint,
	`pickUpCurrency` char(3),
	`pickUpCarNo` varchar(10),
	`dropOffFee` tinyint,
	`dropOffFeeCurrency` char(3),
	`dropOffCarNo` varchar(10),
	`statusId` char(36) NOT NULL,
	`remark` varchar(255),
	`createdAt` timestamp(3),
	`createdBy` char(36) NOT NULL,
	`updatedAt` timestamp(3),
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `reservation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservationCustomer` (
	`id` char(36) NOT NULL,
	`reservationId` char(36) NOT NULL,
	`customerId` char(36) NOT NULL,
	`createdAt` timestamp(3),
	`createdBy` char(36) NOT NULL,
	`updatedAt` timestamp(3),
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `reservationCustomer_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservationRoom` (
	`id` char(36) NOT NULL,
	`reservationId` char(36) NOT NULL,
	`roomId` char(36) NOT NULL,
	`fromDate` date NOT NULL,
	`toDate` date NOT NULL,
	`noOfExtraBed` tinyint,
	`createdAt` timestamp(3),
	`createdBy` char(36) NOT NULL,
	`updatedAt` timestamp(3),
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `reservationRoom_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roomSetUp` (
	`id` char(36) NOT NULL,
	`roomNo` varchar(50) NOT NULL,
	`roomTypeId` char(36) NOT NULL,
	`isAvailable` boolean NOT NULL DEFAULT true,
	`isDoubleBed` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp(3),
	`createdBy` char(36) NOT NULL,
	`updatedAt` timestamp(3),
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `roomSetUp_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roomType` (
	`id` char(36) NOT NULL,
	`roomType` varchar(50) NOT NULL,
	`createdAt` timestamp(3),
	`createdBy` char(36) NOT NULL,
	`updatedAt` timestamp(3),
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
	`createdAt` timestamp(3),
	`createdBy` char(36) NOT NULL,
	`updatedAt` timestamp(3),
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_userName_unique` UNIQUE(`userName`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
