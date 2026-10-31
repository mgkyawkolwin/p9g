ALTER TABLE `prepaid` MODIFY COLUMN `days` int NOT NULL;--> statement-breakpoint
ALTER TABLE `bookingInvoiceItem` ADD `rateUSD` decimal DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `bookingInvoiceItem` ADD `amountUSD` decimal DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `invoice` ADD `depositUSD` decimal DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `invoice` ADD `totalAmountUSD` decimal DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `invoice` ADD `dueAmountUSD` decimal DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE `reservationCustomer` ADD `baggageTransfer` varchar(10);--> statement-breakpoint
ALTER TABLE `reservationCustomer` ADD `visaRequired` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `simpleInvoiceItem` ADD `amountUSD` decimal DEFAULT '0' NOT NULL;