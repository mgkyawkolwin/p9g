ALTER TABLE `customer` DROP INDEX `customer_passport_unique`;
ALTER TABLE `customer` DROP INDEX `customer_nationalId_unique`;
ALTER TABLE `customer` DROP INDEX `customer_email_unique`;
ALTER TABLE `reservation` MODIFY COLUMN `remark` varchar(500);
ALTER TABLE `roomReservation` MODIFY COLUMN `isSingleOccupancy` tinyint(1);
ALTER TABLE `reservation` ADD `depositPaymentMode` varchar(10);