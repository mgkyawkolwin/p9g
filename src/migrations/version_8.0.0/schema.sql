CREATE TABLE `packagePayment` (
	`id` char(36) NOT NULL,
	`prepaidPackageId` char(36) NOT NULL,
	`amount` decimal NOT NULL,
	`paymentDateTimeUTC` datetime(3) NOT NULL,
	`currency` char(3) NOT NULL,
	`paymentMode` varchar(10) NOT NULL DEFAULT 'CASH',
	`remark` varchar(500),
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `packagePayment_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `packagePayment_log` (
  	`log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`id` char(36) NOT NULL,
	`prepaidPackageId` char(36) NOT NULL,
	`amount` decimal NOT NULL,
	`paymentDateTimeUTC` datetime(3) NOT NULL,
	`currency` char(3) NOT NULL,
	`paymentMode` varchar(10) NOT NULL DEFAULT 'CASH',
	`remark` varchar(500),
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	`trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
	`triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE `packageUsage` (
	`id` char(36) NOT NULL,
	`reservationId` char(36) NOT NULL,
	`customerId` char(36) NOT NULL,
	`prepaidPackageId` char(36) NOT NULL,
	`startDate` datetime(3) NOT NULL,
	`endDate` datetime(3) NOT NULL,
	`days` smallint NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `packageUsage_id` PRIMARY KEY(`id`)
);


CREATE TABLE IF NOT EXISTS `packageUsage_log` (
	`log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`id` char(36) NOT NULL,
	`reservationId` char(36) NOT NULL,
	`customerId` char(36) NOT NULL,
	`prepaidPackageId` char(36) NOT NULL,
	`startDate` datetime(3) NOT NULL,
	`endDate` datetime(3) NOT NULL,
	`days` smallint NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	`trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
	`triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

CREATE TABLE `prepaidPackage` (
	`id` char(36) NOT NULL,
	`customerId` char(36) NOT NULL,
	`effectiveStartDate` datetime(3) NOT NULL,
	`effectiveEndDate` datetime(3) NOT NULL,
	`noOfDays` smallint NOT NULL,
	`daysUsed` smallint NOT NULL DEFAULT 0,
	`packageStatus` varchar(10) NOT NULL DEFAULT 'New',
	`price` decimal NOT NULL DEFAULT '0',
	`paidAmount` decimal NOT NULL DEFAULT '0',
	`paymentStatus` varchar(10) NOT NULL DEFAULT 'Unpaid',
	`remark` varchar(500),
	`prepaidPackageTypeId` char(36) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `prepaidPackage_id` PRIMARY KEY(`id`)
);

CREATE TABLE IF NOT EXISTS `prepaidPackage_log` (
	`log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`id` char(36) NOT NULL,
	`customerId` char(36) NOT NULL,
	`effectiveStartDate` datetime(3) NOT NULL,
	`effectiveEndDate` datetime(3) NOT NULL,
	`noOfDays` smallint NOT NULL,
	`daysUsed` smallint NOT NULL DEFAULT 0,
	`packageStatus` varchar(10) NOT NULL DEFAULT 'New',
	`price` decimal NOT NULL DEFAULT '0',
	`paidAmount` decimal NOT NULL DEFAULT '0',
	`paymentStatus` varchar(10) NOT NULL DEFAULT 'Unpaid',
	`remark` varchar(500),
	`prepaidPackageTypeId` char(36) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	`trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
	`triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
);

ALTER TABLE `prepaid` MODIFY COLUMN `days` smallint NOT NULL;
ALTER TABLE `reservation` MODIFY COLUMN `prepaidCode` char(36);
ALTER TABLE `packagePayment` ADD CONSTRAINT `packagePayment_prepaidPackageId_prepaidPackage_id_fk` FOREIGN KEY (`prepaidPackageId`) REFERENCES `prepaidPackage`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `packageUsage` ADD CONSTRAINT `packageUsage_reservationId_reservation_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `packageUsage` ADD CONSTRAINT `packageUsage_customerId_customer_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE restrict ON UPDATE no action;
ALTER TABLE `packageUsage` ADD CONSTRAINT `packageUsage_prepaidPackageId_prepaidPackage_id_fk` FOREIGN KEY (`prepaidPackageId`) REFERENCES `prepaidPackage`(`id`) ON DELETE restrict ON UPDATE no action;
ALTER TABLE `prepaidPackage` ADD CONSTRAINT `prepaidPackage_customerId_customer_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE restrict ON UPDATE no action;
ALTER TABLE `prepaidPackage` ADD CONSTRAINT `prepaidPackage_prepaidPackageTypeId_prepaid_id_fk` FOREIGN KEY (`prepaidPackageTypeId`) REFERENCES `prepaid`(`id`) ON DELETE no action ON UPDATE no action;


DELIMITER $$

-- Triggers for packagePayment
DROP TRIGGER IF EXISTS `packagePayment_after_insert`$$
CREATE TRIGGER `packagePayment_after_insert` AFTER INSERT ON `packagePayment`
FOR EACH ROW
BEGIN
  INSERT INTO `packagePayment_log` (`id`,`prepaidPackageId`,`amount`,`paymentDateTimeUTC`,`currency`,`paymentMode`,`remark`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`prepaidPackageId`,NEW.`amount`,NEW.`paymentDateTimeUTC`,NEW.`currency`,NEW.`paymentMode`,NEW.`remark`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `packagePayment_after_update`$$
CREATE TRIGGER `packagePayment_after_update` AFTER UPDATE ON `packagePayment`
FOR EACH ROW
BEGIN
  INSERT INTO `packagePayment_log` (`id`,`prepaidPackageId`,`amount`,`paymentDateTimeUTC`,`currency`,`paymentMode`,`remark`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`prepaidPackageId`,NEW.`amount`,NEW.`paymentDateTimeUTC`,NEW.`currency`,NEW.`paymentMode`,NEW.`remark`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `packagePayment_after_delete`$$
CREATE TRIGGER `packagePayment_after_delete` AFTER DELETE ON `packagePayment`
FOR EACH ROW
BEGIN
  INSERT INTO `packagePayment_log` (`id`,`prepaidPackageId`,`amount`,`paymentDateTimeUTC`,`currency`,`paymentMode`,`remark`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`prepaidPackageId`,OLD.`amount`,OLD.`paymentDateTimeUTC`,OLD.`currency`,OLD.`paymentMode`,OLD.`remark`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for packageUsage
DROP TRIGGER IF EXISTS `packageUsage_after_insert`$$
CREATE TRIGGER `packageUsage_after_insert` AFTER INSERT ON `packageUsage`
FOR EACH ROW
BEGIN
  INSERT INTO `packageUsage_log` (`id`,`reservationId`,`customerId`,`prepaidPackageId`,`startDate`,`endDate`,`days`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`customerId`,NEW.`prepaidPackageId`,NEW.`startDate`,NEW.`endDate`,NEW.`days`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `packageUsage_after_update`$$
CREATE TRIGGER `packageUsage_after_update` AFTER UPDATE ON `packageUsage`
FOR EACH ROW
BEGIN
  INSERT INTO `packageUsage_log` (`id`,`reservationId`,`customerId`,`prepaidPackageId`,`startDate`,`endDate`,`days`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`customerId`,NEW.`prepaidPackageId`,NEW.`startDate`,NEW.`endDate`,NEW.`days`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `packageUsage_after_delete`$$
CREATE TRIGGER `packageUsage_after_delete` AFTER DELETE ON `packageUsage`
FOR EACH ROW
BEGIN
  INSERT INTO `packageUsage_log` (`id`,`reservationId`,`customerId`,`prepaidPackageId`,`startDate`,`endDate`,`days`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`reservationId`,OLD.`customerId`,OLD.`prepaidPackageId`,OLD.`startDate`,OLD.`endDate`,OLD.`days`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for prepaidPackage
DROP TRIGGER IF EXISTS `prepaidPackage_after_insert`$$
CREATE TRIGGER `prepaidPackage_after_insert` AFTER INSERT ON `prepaidPackage`
FOR EACH ROW
BEGIN
  INSERT INTO `prepaidPackage_log` (`id`,`customerId`,`effectiveStartDate`,`effectiveEndDate`,`noOfDays`,`daysUsed`,`packageStatus`,`price`,`paidAmount`,`paymentStatus`,`remark`,`prepaidPackageTypeId`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`customerId`,NEW.`effectiveStartDate`,NEW.`effectiveEndDate`,NEW.`noOfDays`,NEW.`daysUsed`,NEW.`packageStatus`,NEW.`price`,NEW.`paidAmount`,NEW.`paymentStatus`,NEW.`remark`,NEW.`prepaidPackageTypeId`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `prepaidPackage_after_update`$$
CREATE TRIGGER `prepaidPackage_after_update` AFTER UPDATE ON `prepaidPackage`
FOR EACH ROW
BEGIN
  INSERT INTO `prepaidPackage_log` (`id`,`customerId`,`effectiveStartDate`,`effectiveEndDate`,`noOfDays`,`daysUsed`,`packageStatus`,`price`,`paidAmount`,`paymentStatus`,`remark`,`prepaidPackageTypeId`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`customerId`,NEW.`effectiveStartDate`,NEW.`effectiveEndDate`,NEW.`noOfDays`,NEW.`daysUsed`,NEW.`packageStatus`,NEW.`price`,NEW.`paidAmount`,NEW.`paymentStatus`,NEW.`remark`,NEW.`prepaidPackageTypeId`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `prepaidPackage_after_delete`$$
CREATE TRIGGER `prepaidPackage_after_delete` AFTER DELETE ON `prepaidPackage`
FOR EACH ROW
BEGIN
  INSERT INTO `prepaidPackage_log` (`id`,`customerId`,`effectiveStartDate`,`effectiveEndDate`,`noOfDays`,`daysUsed`,`packageStatus`,`price`,`paidAmount`,`paymentStatus`,`remark`,`prepaidPackageTypeId`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`customerId`,OLD.`effectiveStartDate`,OLD.`effectiveEndDate`,OLD.`noOfDays`,OLD.`daysUsed`,OLD.`packageStatus`,OLD.`price`,OLD.`paidAmount`,OLD.`paymentStatus`,OLD.`remark`,OLD.`prepaidPackageTypeId`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

DELIMITER ;