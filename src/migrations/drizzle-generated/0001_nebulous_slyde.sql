ALTER TABLE `customer` DROP INDEX `customer_passport_unique`;--> statement-breakpoint
ALTER TABLE `customer` DROP INDEX `customer_nationalId_unique`;--> statement-breakpoint
ALTER TABLE `customer` DROP INDEX `customer_email_unique`;--> statement-breakpoint
ALTER TABLE `reservation` MODIFY COLUMN `remark` varchar(500);--> statement-breakpoint
ALTER TABLE `roomReservation` MODIFY COLUMN `isSingleOccupancy` boolean;--> statement-breakpoint
ALTER TABLE `reservation` ADD `depositPaymentMode` varchar(10);