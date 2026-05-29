ALTER TABLE `reservation_log` ADD `pickupRemark` varchar(500);--> statement-breakpoint
ALTER TABLE `reservation_log` ADD `dropOffRemark` varchar(500);--> statement-breakpoint
ALTER TABLE `reservation` ADD `pickupRemark` varchar(500);--> statement-breakpoint
ALTER TABLE `reservation` ADD `dropOffRemark` varchar(500);