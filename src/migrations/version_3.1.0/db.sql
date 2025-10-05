ALTER TABLE `reservation` ADD `prepaidCode` char(8);
ALTER TABLE `roomCharge` MODIFY COLUMN `reservationId` char(36) NOT NULL;
ALTER TABLE `bill` MODIFY COLUMN `reservationId` char(36) NULL;
ALTER TABLE `bill` ADD CONSTRAINT `bill_reservationId_reservation_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `roomCharge` MODIFY COLUMN `reservationId` char(36) NULL;
ALTER TABLE `roomCharge` ADD CONSTRAINT `roomCharge_reservationId_reservation_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE set null ON UPDATE no action;