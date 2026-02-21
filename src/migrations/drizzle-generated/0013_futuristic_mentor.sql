CREATE TABLE `bookingInvoiceItem` (
	`id` char(36) NOT NULL,
	`invoiceId` char(36) NOT NULL,
	`description` varchar(500) NOT NULL,
	`location` varchar(255),
	`startDate` datetime(3),
	`endDate` datetime(3),
	`pax` smallint NOT NULL DEFAULT 0,
	`rateKWR` decimal NOT NULL DEFAULT '0',
	`rateTHB` decimal NOT NULL DEFAULT '0',
	`amountKWR` decimal NOT NULL DEFAULT '0',
	`amountTHB` decimal NOT NULL DEFAULT '0',
	`noOfRooms` smallint NOT NULL DEFAULT 0,
	`noOfDays` smallint NOT NULL DEFAULT 0,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `bookingInvoiceItem_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice` (
	`id` char(36) NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`invoiceDate` datetime(3) NOT NULL,
	`agentName` varchar(255),
	`customerName` varchar(255) NOT NULL,
	`pax` varchar(50),
	`depositKWR` decimal NOT NULL DEFAULT '0',
	`depositTHB` decimal NOT NULL DEFAULT '0',
	`totalAmountKWR` decimal NOT NULL DEFAULT '0',
	`totalAmountTHB` decimal NOT NULL DEFAULT '0',
	`dueAmountKWR` decimal NOT NULL DEFAULT '0',
	`dueAmountTHB` decimal NOT NULL DEFAULT '0',
	`status` varchar(20) NOT NULL,
	`included` varchar(1000),
	`notIncluded` text,
	`note` varchar(1000),
	`bookingSource` varchar(50),
	`bookingPerson` varchar(50),
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `invoice_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simpleInvoiceItem` (
	`id` char(36) NOT NULL,
	`invoiceId` char(36) NOT NULL,
	`description` varchar(500) NOT NULL,
	`amountKWR` decimal NOT NULL DEFAULT '0',
	`amountTHB` decimal NOT NULL DEFAULT '0',
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `simpleInvoiceItem_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `bookingInvoiceItem` ADD CONSTRAINT `bookingInvoiceItem_invoiceId_invoice_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `simpleInvoiceItem` ADD CONSTRAINT `simpleInvoiceItem_invoiceId_invoice_id_fk` FOREIGN KEY (`invoiceId`) REFERENCES `invoice`(`id`) ON DELETE cascade ON UPDATE no action;