ALTER TABLE `reservation` RENAME COLUMN `statusId` TO `reservationStatusId`;--> statement-breakpoint
ALTER TABLE `reservation` MODIFY COLUMN `reservationTypeId` char(36);--> statement-breakpoint
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_reservationStatusId_config_id_fk` FOREIGN KEY (`reservationStatusId`) REFERENCES `config`(`id`) ON DELETE no action ON UPDATE no action;