ALTER TABLE `customer` ADD `isBlackListed` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `customer` ADD `isDeleted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `reservation` ADD `paymentRemark` varchar(500);