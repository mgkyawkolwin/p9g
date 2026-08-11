-- Migration: Create audit log tables and triggers for existing schema tables
-- Version: 7.1.0

SET FOREIGN_KEY_CHECKS = 0;

-- Log table for bill
CREATE TABLE IF NOT EXISTS `bill_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `dateUTC` DATETIME,
  `paymentMode` VARCHAR(10) NOT NULL,
  `paymentType` VARCHAR(10) NOT NULL,
  `reservationId` CHAR(36) NOT NULL,
  `itemName` VARCHAR(100) NOT NULL,
  `unitPrice` DECIMAL(10,0) NOT NULL,
  `quantity` TINYINT NOT NULL,
  `amount` DECIMAL(10,0) NOT NULL,
  `isPaid` TINYINT(1) NOT NULL,
  `paidOnUTC` DATETIME,
  `currency` CHAR(3),
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for config
CREATE TABLE IF NOT EXISTS `config_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `group` VARCHAR(50) NOT NULL,
  `value` VARCHAR(50) NOT NULL,
  `text` VARCHAR(50) NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for customer
CREATE TABLE IF NOT EXISTS `customer_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255),
  `englishName` VARCHAR(255) NOT NULL,
  `dob` VARCHAR(50),
  `passport` VARCHAR(50),
  `nationalId` VARCHAR(50),
  `gender` VARCHAR(10),
  `address` VARCHAR(255),
  `remarks` VARCHAR(1024),
  `country` VARCHAR(50),
  `phone` VARCHAR(50),
  `email` VARCHAR(50),
  `isBlackListed` TINYINT(1) NOT NULL DEFAULT 0,
  `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for feedback
CREATE TABLE IF NOT EXISTS `feedback_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `reservationId` CHAR(36) NOT NULL,
  `customerId` CHAR(36),
  `feedback` TEXT,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for invoice
CREATE TABLE IF NOT EXISTS `invoice_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `invoiceNumber` VARCHAR(50) NOT NULL,
  `invoiceDate` DATETIME(3) NOT NULL,
  `agentName` VARCHAR(255),
  `customerName` VARCHAR(255) NOT NULL,
  `pax` VARCHAR(50),
  `depositKWR` DECIMAL(10,0) NOT NULL DEFAULT 0,
  `depositTHB` DECIMAL(10,0) NOT NULL DEFAULT 0,
  `totalAmountKWR` DECIMAL(10,0) NOT NULL DEFAULT 0,
  `totalAmountTHB` DECIMAL(10,0) NOT NULL DEFAULT 0,
  `dueAmountKWR` DECIMAL(10,0) NOT NULL DEFAULT 0,
  `dueAmountTHB` DECIMAL(10,0) NOT NULL DEFAULT 0,
  `status` VARCHAR(20) NOT NULL,
  `included` VARCHAR(1000),
  `notIncluded` TEXT,
  `note` VARCHAR(1000),
  `bookingSource` VARCHAR(50),
  `bookingPerson` VARCHAR(50),
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for simpleInvoiceItem
CREATE TABLE IF NOT EXISTS `simpleInvoiceItem_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `invoiceId` CHAR(36) NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `amountKWR` DECIMAL(10,0) NOT NULL DEFAULT 0,
  `amountTHB` DECIMAL(10,0) NOT NULL DEFAULT 0,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for bookingInvoiceItem
CREATE TABLE IF NOT EXISTS `bookingInvoiceItem_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `invoiceId` CHAR(36) NOT NULL,
  `description` VARCHAR(500) NOT NULL,
  `location` VARCHAR(255),
  `startDate` DATETIME(3),
  `endDate` DATETIME(3),
  `pax` SMALLINT NOT NULL DEFAULT 0,
  `rateKWR` DECIMAL(10,0) NOT NULL DEFAULT 0,
  `rateTHB` DECIMAL(10,0) NOT NULL DEFAULT 0,
  `amountKWR` DECIMAL(10,0) NOT NULL DEFAULT 0,
  `amountTHB` DECIMAL(10,0) NOT NULL DEFAULT 0,
  `noOfRooms` SMALLINT NOT NULL DEFAULT 0,
  `noOfDays` SMALLINT NOT NULL DEFAULT 0,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for media
CREATE TABLE IF NOT EXISTS `media_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `reservationId` CHAR(36) NOT NULL,
  `mediaGroupId` CHAR(36) NOT NULL,
  `customerId` CHAR(36),
  `url` VARCHAR(500) NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for payment
CREATE TABLE IF NOT EXISTS `payment_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `reservationId` CHAR(36) NOT NULL,
  `paymentDateUTC` DATETIME NOT NULL,
  `paymentType` VARCHAR(10) NOT NULL,
  `amount` DECIMAL(10,0) NOT NULL,
  `amountInCurrency` DECIMAL(10,0) NOT NULL,
  `currency` CHAR(3) NOT NULL,
  `paymentMode` VARCHAR(10) NOT NULL,
  `remark` VARCHAR(200),
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for pookie
CREATE TABLE IF NOT EXISTS `pookie_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `date` DATETIME(3) NOT NULL,
  `hole` VARCHAR(10) NOT NULL,
  `isBusy` TINYINT(1) NOT NULL,
  `location` VARCHAR(10) NOT NULL,
  `noOfPeople` TINYINT NOT NULL,
  `rooms` VARCHAR(50) NOT NULL,
  `time` DATETIME(3) NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for pookieConfig
CREATE TABLE IF NOT EXISTS `pookieConfig_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `contactUrl` VARCHAR(500) NOT NULL,
  `key` CHAR(36) NOT NULL,
  `version` VARCHAR(10) NOT NULL,
  `seeResultUntil` INT NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for pookieDevice
CREATE TABLE IF NOT EXISTS `pookieDevice_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `deviceId` VARCHAR(50) NOT NULL,
  `isBlocked` TINYINT(1) NOT NULL,
  `lastRequestAtUTC` DATETIME(3) NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for prepaid
CREATE TABLE IF NOT EXISTS `prepaid_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `value` VARCHAR(50) NOT NULL,
  `text` VARCHAR(50) NOT NULL,
  `days` TINYINT NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for promotion
CREATE TABLE IF NOT EXISTS `promotion_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `value` VARCHAR(50) NOT NULL,
  `text` VARCHAR(50) NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for reservation
CREATE TABLE IF NOT EXISTS `reservation_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `reservationTypeId` CHAR(36) NOT NULL,
  `invoiceStatusId` CHAR(36) NOT NULL,
  `invoiceNumber` VARCHAR(10),
  `tourCompany` VARCHAR(100),
  `arrivalDateTime` DATETIME(3),
  `arrivalFlight` VARCHAR(50),
  `bookingSource` VARCHAR(50),
  `departureDateTime` DATETIME(3),
  `departureFlight` VARCHAR(50),
  `checkInDate` DATETIME(3),
  `checkOutDate` DATETIME(3),
  `noOfDays` SMALLINT,
  `depositAmount` INT,
  `depositAmountInCurrency` INT,
  `depositCurrency` CHAR(3),
  `depositDateUTC` DATE,
  `depositPaymentMode` VARCHAR(10),
  `roomNo` VARCHAR(10),
  `isSingleOccupancy` TINYINT(1),
  `noOfGuests` TINYINT,
  `pickUpTypeId` CHAR(36),
  `pickUpFee` TINYINT,
  `pickUpFeeCurrency` CHAR(3),
  `pickUpFeePaidOnUTC` DATETIME(3),
  `pickUpCarNo` VARCHAR(10),
  `pickUpDriver` VARCHAR(50),
  `prepaidCode` CHAR(8),
  `prepaidPackageId` CHAR(36),
  `promotionPackageId` CHAR(36),
  `dropOffTypeId` CHAR(36),
  `dropOffFee` TINYINT,
  `dropOffFeeCurrency` CHAR(3),
  `dropOffFeePaidOnUTC` DATETIME(3),
  `dropOffCarNo` VARCHAR(10),
  `dropOffDriver` VARCHAR(50),
  `reservationStatusId` CHAR(36) NOT NULL,
  `remark` VARCHAR(500),
  `paymentRemark` VARCHAR(500),
  `totalAmount` DECIMAL(10,0),
  `paidAmount` DECIMAL(10,0),
  `discountAmount` DECIMAL(10,0),
  `tax` DECIMAL(10,0),
  `taxAmount` DECIMAL(10,0),
  `netAmount` DECIMAL(10,0),
  `dueAmount` DECIMAL(10,0),
  `golfCart` VARCHAR(20),
  `location` VARCHAR(10) NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for reservationCustomer
CREATE TABLE IF NOT EXISTS `reservationCustomer_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `reservationId` CHAR(36) NOT NULL,
  `customerId` CHAR(36) NOT NULL,
  `tdacStatusId` CHAR(36) NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for room
CREATE TABLE IF NOT EXISTS `room_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `roomNo` VARCHAR(50) NOT NULL,
  `roomTypeId` CHAR(36) NOT NULL,
  `isAvailable` TINYINT(1) NOT NULL DEFAULT 1,
  `location` VARCHAR(10),
  `zone` VARCHAR(10) NOT NULL,
  `bedType` VARCHAR(10) NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for roomCharge
CREATE TABLE IF NOT EXISTS `roomCharge_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `reservationId` CHAR(36) NOT NULL,
  `startDate` DATETIME(3),
  `endDate` DATETIME(3),
  `roomId` CHAR(36),
  `roomTypeId` CHAR(36) NOT NULL,
  `roomRate` DECIMAL(10,0) NOT NULL,
  `roomSurcharge` DECIMAL(10,0) NOT NULL,
  `singleRate` DECIMAL(10,0) NOT NULL,
  `seasonSurcharge` DECIMAL(10,0) NOT NULL,
  `extraBedRate` DECIMAL(10,0) NOT NULL,
  `totalRate` DECIMAL(10,0) NOT NULL,
  `noOfDays` TINYINT NOT NULL,
  `totalAmount` DECIMAL(10,0) NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for roomReservation
CREATE TABLE IF NOT EXISTS `roomReservation_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `roomId` CHAR(36) NOT NULL,
  `reservationId` CHAR(36) NOT NULL,
  `noOfExtraBed` TINYINT(1) NOT NULL DEFAULT 0,
  `checkInDate` DATETIME(3) NOT NULL,
  `checkOutDate` DATETIME(3) NOT NULL,
  `isSingleOccupancy` TINYINT(1),
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for roomRate
CREATE TABLE IF NOT EXISTS `roomRate_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `roomTypeId` CHAR(36) NOT NULL,
  `roomRate` DECIMAL(10,0) NOT NULL,
  `singleRate` DECIMAL(10,0) NOT NULL,
  `roomSurcharge` DECIMAL(10,0) NOT NULL,
  `seasonSurcharge` DECIMAL(10,0) NOT NULL,
  `extraBedRate` DECIMAL(10,0) NOT NULL,
  `month` TINYINT NOT NULL,
  `location` VARCHAR(10) NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for roomType
CREATE TABLE IF NOT EXISTS `roomType_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `roomType` VARCHAR(50) NOT NULL,
  `roomTypeText` VARCHAR(50) NOT NULL,
  `maxOccupancy` TINYINT,
  `isDoubleBed` BINARY(1),
  `location` VARCHAR(10),
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for user
CREATE TABLE IF NOT EXISTS `user_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `userName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255),
  `password` VARCHAR(100) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `location` VARCHAR(10) NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log table for version
CREATE TABLE IF NOT EXISTS `version_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `version` VARCHAR(10) NOT NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

DELIMITER $$

-- Triggers for bill
DROP TRIGGER IF EXISTS `bill_after_insert`$$
CREATE TRIGGER `bill_after_insert` AFTER INSERT ON `bill`
FOR EACH ROW
BEGIN
  INSERT INTO `bill_log` (`id`,`dateUTC`,`paymentMode`,`paymentType`,`reservationId`,`itemName`,`unitPrice`,`quantity`,`amount`,`isPaid`,`paidOnUTC`,`currency`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`dateUTC`,NEW.`paymentMode`,NEW.`paymentType`,NEW.`reservationId`,NEW.`itemName`,NEW.`unitPrice`,NEW.`quantity`,NEW.`amount`,NEW.`isPaid`,NEW.`paidOnUTC`,NEW.`currency`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `bill_after_update`$$
CREATE TRIGGER `bill_after_update` AFTER UPDATE ON `bill`
FOR EACH ROW
BEGIN
  INSERT INTO `bill_log` (`id`,`dateUTC`,`paymentMode`,`paymentType`,`reservationId`,`itemName`,`unitPrice`,`quantity`,`amount`,`isPaid`,`paidOnUTC`,`currency`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`dateUTC`,NEW.`paymentMode`,NEW.`paymentType`,NEW.`reservationId`,NEW.`itemName`,NEW.`unitPrice`,NEW.`quantity`,NEW.`amount`,NEW.`isPaid`,NEW.`paidOnUTC`,NEW.`currency`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `bill_after_delete`$$
CREATE TRIGGER `bill_after_delete` AFTER DELETE ON `bill`
FOR EACH ROW
BEGIN
  INSERT INTO `bill_log` (`id`,`dateUTC`,`paymentMode`,`paymentType`,`reservationId`,`itemName`,`unitPrice`,`quantity`,`amount`,`isPaid`,`paidOnUTC`,`currency`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`dateUTC`,OLD.`paymentMode`,OLD.`paymentType`,OLD.`reservationId`,OLD.`itemName`,OLD.`unitPrice`,OLD.`quantity`,OLD.`amount`,OLD.`isPaid`,OLD.`paidOnUTC`,OLD.`currency`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for config
DROP TRIGGER IF EXISTS `config_after_insert`$$
CREATE TRIGGER `config_after_insert` AFTER INSERT ON `config`
FOR EACH ROW
BEGIN
  INSERT INTO `config_log` (`id`,`group`,`value`,`text`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`group`,NEW.`value`,NEW.`text`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `config_after_update`$$
CREATE TRIGGER `config_after_update` AFTER UPDATE ON `config`
FOR EACH ROW
BEGIN
  INSERT INTO `config_log` (`id`,`group`,`value`,`text`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`group`,NEW.`value`,NEW.`text`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `config_after_delete`$$
CREATE TRIGGER `config_after_delete` AFTER DELETE ON `config`
FOR EACH ROW
BEGIN
  INSERT INTO `config_log` (`id`,`group`,`value`,`text`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`group`,OLD.`value`,OLD.`text`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for customer
DROP TRIGGER IF EXISTS `customer_after_insert`$$
CREATE TRIGGER `customer_after_insert` AFTER INSERT ON `customer`
FOR EACH ROW
BEGIN
  INSERT INTO `customer_log` (`id`,`name`,`englishName`,`dob`,`passport`,`nationalId`,`gender`,`address`,`remarks`,`country`,`phone`,`email`,`isBlackListed`,`isDeleted`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`name`,NEW.`englishName`,NEW.`dob`,NEW.`passport`,NEW.`nationalId`,NEW.`gender`,NEW.`address`,NEW.`remarks`,NEW.`country`,NEW.`phone`,NEW.`email`,NEW.`isBlackListed`,NEW.`isDeleted`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `customer_after_update`$$
CREATE TRIGGER `customer_after_update` AFTER UPDATE ON `customer`
FOR EACH ROW
BEGIN
  INSERT INTO `customer_log` (`id`,`name`,`englishName`,`dob`,`passport`,`nationalId`,`gender`,`address`,`remarks`,`country`,`phone`,`email`,`isBlackListed`,`isDeleted`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`name`,NEW.`englishName`,NEW.`dob`,NEW.`passport`,NEW.`nationalId`,NEW.`gender`,NEW.`address`,NEW.`remarks`,NEW.`country`,NEW.`phone`,NEW.`email`,NEW.`isBlackListed`,NEW.`isDeleted`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `customer_after_delete`$$
CREATE TRIGGER `customer_after_delete` AFTER DELETE ON `customer`
FOR EACH ROW
BEGIN
  INSERT INTO `customer_log` (`id`,`name`,`englishName`,`dob`,`passport`,`nationalId`,`gender`,`address`,`remarks`,`country`,`phone`,`email`,`isBlackListed`,`isDeleted`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`name`,OLD.`englishName`,OLD.`dob`,OLD.`passport`,OLD.`nationalId`,OLD.`gender`,OLD.`address`,OLD.`remarks`,OLD.`country`,OLD.`phone`,OLD.`email`,OLD.`isBlackListed`,OLD.`isDeleted`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for feedback
DROP TRIGGER IF EXISTS `feedback_after_insert`$$
CREATE TRIGGER `feedback_after_insert` AFTER INSERT ON `feedback`
FOR EACH ROW
BEGIN
  INSERT INTO `feedback_log` (`id`,`reservationId`,`customerId`,`feedback`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`customerId`,NEW.`feedback`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `feedback_after_update`$$
CREATE TRIGGER `feedback_after_update` AFTER UPDATE ON `feedback`
FOR EACH ROW
BEGIN
  INSERT INTO `feedback_log` (`id`,`reservationId`,`customerId`,`feedback`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`customerId`,NEW.`feedback`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `feedback_after_delete`$$
CREATE TRIGGER `feedback_after_delete` AFTER DELETE ON `feedback`
FOR EACH ROW
BEGIN
  INSERT INTO `feedback_log` (`id`,`reservationId`,`customerId`,`feedback`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`reservationId`,OLD.`customerId`,OLD.`feedback`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for invoice
DROP TRIGGER IF EXISTS `invoice_after_insert`$$
CREATE TRIGGER `invoice_after_insert` AFTER INSERT ON `invoice`
FOR EACH ROW
BEGIN
  INSERT INTO `invoice_log` (`id`,`invoiceNumber`,`invoiceDate`,`agentName`,`customerName`,`pax`,`depositKWR`,`depositTHB`,`totalAmountKWR`,`totalAmountTHB`,`dueAmountKWR`,`dueAmountTHB`,`status`,`included`,`notIncluded`,`note`,`bookingSource`,`bookingPerson`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`invoiceNumber`,NEW.`invoiceDate`,NEW.`agentName`,NEW.`customerName`,NEW.`pax`,NEW.`depositKWR`,NEW.`depositTHB`,NEW.`totalAmountKWR`,NEW.`totalAmountTHB`,NEW.`dueAmountKWR`,NEW.`dueAmountTHB`,NEW.`status`,NEW.`included`,NEW.`notIncluded`,NEW.`note`,NEW.`bookingSource`,NEW.`bookingPerson`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `invoice_after_update`$$
CREATE TRIGGER `invoice_after_update` AFTER UPDATE ON `invoice`
FOR EACH ROW
BEGIN
  INSERT INTO `invoice_log` (`id`,`invoiceNumber`,`invoiceDate`,`agentName`,`customerName`,`pax`,`depositKWR`,`depositTHB`,`totalAmountKWR`,`totalAmountTHB`,`dueAmountKWR`,`dueAmountTHB`,`status`,`included`,`notIncluded`,`note`,`bookingSource`,`bookingPerson`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`invoiceNumber`,NEW.`invoiceDate`,NEW.`agentName`,NEW.`customerName`,NEW.`pax`,NEW.`depositKWR`,NEW.`depositTHB`,NEW.`totalAmountKWR`,NEW.`totalAmountTHB`,NEW.`dueAmountKWR`,NEW.`dueAmountTHB`,NEW.`status`,NEW.`included`,NEW.`notIncluded`,NEW.`note`,NEW.`bookingSource`,NEW.`bookingPerson`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `invoice_after_delete`$$
CREATE TRIGGER `invoice_after_delete` AFTER DELETE ON `invoice`
FOR EACH ROW
BEGIN
  INSERT INTO `invoice_log` (`id`,`invoiceNumber`,`invoiceDate`,`agentName`,`customerName`,`pax`,`depositKWR`,`depositTHB`,`totalAmountKWR`,`totalAmountTHB`,`dueAmountKWR`,`dueAmountTHB`,`status`,`included`,`notIncluded`,`note`,`bookingSource`,`bookingPerson`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`invoiceNumber`,OLD.`invoiceDate`,OLD.`agentName`,OLD.`customerName`,OLD.`pax`,OLD.`depositKWR`,OLD.`depositTHB`,OLD.`totalAmountKWR`,OLD.`totalAmountTHB`,OLD.`dueAmountKWR`,OLD.`dueAmountTHB`,OLD.`status`,OLD.`included`,OLD.`notIncluded`,OLD.`note`,OLD.`bookingSource`,OLD.`bookingPerson`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for simpleInvoiceItem
DROP TRIGGER IF EXISTS `simpleInvoiceItem_after_insert`$$
CREATE TRIGGER `simpleInvoiceItem_after_insert` AFTER INSERT ON `simpleInvoiceItem`
FOR EACH ROW
BEGIN
  INSERT INTO `simpleInvoiceItem_log` (`id`,`invoiceId`,`description`,`amountKWR`,`amountTHB`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`invoiceId`,NEW.`description`,NEW.`amountKWR`,NEW.`amountTHB`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `simpleInvoiceItem_after_update`$$
CREATE TRIGGER `simpleInvoiceItem_after_update` AFTER UPDATE ON `simpleInvoiceItem`
FOR EACH ROW
BEGIN
  INSERT INTO `simpleInvoiceItem_log` (`id`,`invoiceId`,`description`,`amountKWR`,`amountTHB`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`invoiceId`,NEW.`description`,NEW.`amountKWR`,NEW.`amountTHB`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `simpleInvoiceItem_after_delete`$$
CREATE TRIGGER `simpleInvoiceItem_after_delete` AFTER DELETE ON `simpleInvoiceItem`
FOR EACH ROW
BEGIN
  INSERT INTO `simpleInvoiceItem_log` (`id`,`invoiceId`,`description`,`amountKWR`,`amountTHB`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`invoiceId`,OLD.`description`,OLD.`amountKWR`,OLD.`amountTHB`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for bookingInvoiceItem
DROP TRIGGER IF EXISTS `bookingInvoiceItem_after_insert`$$
CREATE TRIGGER `bookingInvoiceItem_after_insert` AFTER INSERT ON `bookingInvoiceItem`
FOR EACH ROW
BEGIN
  INSERT INTO `bookingInvoiceItem_log` (`id`,`invoiceId`,`description`,`location`,`startDate`,`endDate`,`pax`,`rateKWR`,`rateTHB`,`amountKWR`,`amountTHB`,`noOfRooms`,`noOfDays`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`invoiceId`,NEW.`description`,NEW.`location`,NEW.`startDate`,NEW.`endDate`,NEW.`pax`,NEW.`rateKWR`,NEW.`rateTHB`,NEW.`amountKWR`,NEW.`amountTHB`,NEW.`noOfRooms`,NEW.`noOfDays`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `bookingInvoiceItem_after_update`$$
CREATE TRIGGER `bookingInvoiceItem_after_update` AFTER UPDATE ON `bookingInvoiceItem`
FOR EACH ROW
BEGIN
  INSERT INTO `bookingInvoiceItem_log` (`id`,`invoiceId`,`description`,`location`,`startDate`,`endDate`,`pax`,`rateKWR`,`rateTHB`,`amountKWR`,`amountTHB`,`noOfRooms`,`noOfDays`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`invoiceId`,NEW.`description`,NEW.`location`,NEW.`startDate`,NEW.`endDate`,NEW.`pax`,NEW.`rateKWR`,NEW.`rateTHB`,NEW.`amountKWR`,NEW.`amountTHB`,NEW.`noOfRooms`,NEW.`noOfDays`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `bookingInvoiceItem_after_delete`$$
CREATE TRIGGER `bookingInvoiceItem_after_delete` AFTER DELETE ON `bookingInvoiceItem`
FOR EACH ROW
BEGIN
  INSERT INTO `bookingInvoiceItem_log` (`id`,`invoiceId`,`description`,`location`,`startDate`,`endDate`,`pax`,`rateKWR`,`rateTHB`,`amountKWR`,`amountTHB`,`noOfRooms`,`noOfDays`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`invoiceId`,OLD.`description`,OLD.`location`,OLD.`startDate`,OLD.`endDate`,OLD.`pax`,OLD.`rateKWR`,OLD.`rateTHB`,OLD.`amountKWR`,OLD.`amountTHB`,OLD.`noOfRooms`,OLD.`noOfDays`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for media
DROP TRIGGER IF EXISTS `media_after_insert`$$
CREATE TRIGGER `media_after_insert` AFTER INSERT ON `media`
FOR EACH ROW
BEGIN
  INSERT INTO `media_log` (`id`,`reservationId`,`mediaGroupId`,`customerId`,`url`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`mediaGroupId`,NEW.`customerId`,NEW.`url`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `media_after_update`$$
CREATE TRIGGER `media_after_update` AFTER UPDATE ON `media`
FOR EACH ROW
BEGIN
  INSERT INTO `media_log` (`id`,`reservationId`,`mediaGroupId`,`customerId`,`url`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`mediaGroupId`,NEW.`customerId`,NEW.`url`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `media_after_delete`$$
CREATE TRIGGER `media_after_delete` AFTER DELETE ON `media`
FOR EACH ROW
BEGIN
  INSERT INTO `media_log` (`id`,`reservationId`,`mediaGroupId`,`customerId`,`url`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`reservationId`,OLD.`mediaGroupId`,OLD.`customerId`,OLD.`url`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for payment
DROP TRIGGER IF EXISTS `payment_after_insert`$$
CREATE TRIGGER `payment_after_insert` AFTER INSERT ON `payment`
FOR EACH ROW
BEGIN
  INSERT INTO `payment_log` (`id`,`reservationId`,`paymentDateUTC`,`paymentType`,`amount`,`amountInCurrency`,`currency`,`paymentMode`,`remark`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`paymentDateUTC`,NEW.`paymentType`,NEW.`amount`,NEW.`amountInCurrency`,NEW.`currency`,NEW.`paymentMode`,NEW.`remark`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `payment_after_update`$$
CREATE TRIGGER `payment_after_update` AFTER UPDATE ON `payment`
FOR EACH ROW
BEGIN
  INSERT INTO `payment_log` (`id`,`reservationId`,`paymentDateUTC`,`paymentType`,`amount`,`amountInCurrency`,`currency`,`paymentMode`,`remark`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`paymentDateUTC`,NEW.`paymentType`,NEW.`amount`,NEW.`amountInCurrency`,NEW.`currency`,NEW.`paymentMode`,NEW.`remark`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `payment_after_delete`$$
CREATE TRIGGER `payment_after_delete` AFTER DELETE ON `payment`
FOR EACH ROW
BEGIN
  INSERT INTO `payment_log` (`id`,`reservationId`,`paymentDateUTC`,`paymentType`,`amount`,`amountInCurrency`,`currency`,`paymentMode`,`remark`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`reservationId`,OLD.`paymentDateUTC`,OLD.`paymentType`,OLD.`amount`,OLD.`amountInCurrency`,OLD.`currency`,OLD.`paymentMode`,OLD.`remark`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for pookie
DROP TRIGGER IF EXISTS `pookie_after_insert`$$
CREATE TRIGGER `pookie_after_insert` AFTER INSERT ON `pookie`
FOR EACH ROW
BEGIN
  INSERT INTO `pookie_log` (`id`,`date`,`hole`,`isBusy`,`location`,`noOfPeople`,`rooms`,`time`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`date`,NEW.`hole`,NEW.`isBusy`,NEW.`location`,NEW.`noOfPeople`,NEW.`rooms`,NEW.`time`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `pookie_after_update`$$
CREATE TRIGGER `pookie_after_update` AFTER UPDATE ON `pookie`
FOR EACH ROW
BEGIN
  INSERT INTO `pookie_log` (`id`,`date`,`hole`,`isBusy`,`location`,`noOfPeople`,`rooms`,`time`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`date`,NEW.`hole`,NEW.`isBusy`,NEW.`location`,NEW.`noOfPeople`,NEW.`rooms`,NEW.`time`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `pookie_after_delete`$$
CREATE TRIGGER `pookie_after_delete` AFTER DELETE ON `pookie`
FOR EACH ROW
BEGIN
  INSERT INTO `pookie_log` (`id`,`date`,`hole`,`isBusy`,`location`,`noOfPeople`,`rooms`,`time`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`date`,OLD.`hole`,OLD.`isBusy`,OLD.`location`,OLD.`noOfPeople`,OLD.`rooms`,OLD.`time`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for pookieConfig
DROP TRIGGER IF EXISTS `pookieConfig_after_insert`$$
CREATE TRIGGER `pookieConfig_after_insert` AFTER INSERT ON `pookieConfig`
FOR EACH ROW
BEGIN
  INSERT INTO `pookieConfig_log` (`id`,`contactUrl`,`key`,`version`,`seeResultUntil`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`contactUrl`,NEW.`key`,NEW.`version`,NEW.`seeResultUntil`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `pookieConfig_after_update`$$
CREATE TRIGGER `pookieConfig_after_update` AFTER UPDATE ON `pookieConfig`
FOR EACH ROW
BEGIN
  INSERT INTO `pookieConfig_log` (`id`,`contactUrl`,`key`,`version`,`seeResultUntil`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`contactUrl`,NEW.`key`,NEW.`version`,NEW.`seeResultUntil`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `pookieConfig_after_delete`$$
CREATE TRIGGER `pookieConfig_after_delete` AFTER DELETE ON `pookieConfig`
FOR EACH ROW
BEGIN
  INSERT INTO `pookieConfig_log` (`id`,`contactUrl`,`key`,`version`,`seeResultUntil`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`contactUrl`,OLD.`key`,OLD.`version`,OLD.`seeResultUntil`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for pookieDevice
DROP TRIGGER IF EXISTS `pookieDevice_after_insert`$$
CREATE TRIGGER `pookieDevice_after_insert` AFTER INSERT ON `pookieDevice`
FOR EACH ROW
BEGIN
  INSERT INTO `pookieDevice_log` (`id`,`deviceId`,`isBlocked`,`lastRequestAtUTC`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`deviceId`,NEW.`isBlocked`,NEW.`lastRequestAtUTC`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `pookieDevice_after_update`$$
CREATE TRIGGER `pookieDevice_after_update` AFTER UPDATE ON `pookieDevice`
FOR EACH ROW
BEGIN
  INSERT INTO `pookieDevice_log` (`id`,`deviceId`,`isBlocked`,`lastRequestAtUTC`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`deviceId`,NEW.`isBlocked`,NEW.`lastRequestAtUTC`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `pookieDevice_after_delete`$$
CREATE TRIGGER `pookieDevice_after_delete` AFTER DELETE ON `pookieDevice`
FOR EACH ROW
BEGIN
  INSERT INTO `pookieDevice_log` (`id`,`deviceId`,`isBlocked`,`lastRequestAtUTC`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`deviceId`,OLD.`isBlocked`,OLD.`lastRequestAtUTC`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for prepaid
DROP TRIGGER IF EXISTS `prepaid_after_insert`$$
CREATE TRIGGER `prepaid_after_insert` AFTER INSERT ON `prepaid`
FOR EACH ROW
BEGIN
  INSERT INTO `prepaid_log` (`id`,`value`,`text`,`days`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`value`,NEW.`text`,NEW.`days`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `prepaid_after_update`$$
CREATE TRIGGER `prepaid_after_update` AFTER UPDATE ON `prepaid`
FOR EACH ROW
BEGIN
  INSERT INTO `prepaid_log` (`id`,`value`,`text`,`days`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`value`,NEW.`text`,NEW.`days`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `prepaid_after_delete`$$
CREATE TRIGGER `prepaid_after_delete` AFTER DELETE ON `prepaid`
FOR EACH ROW
BEGIN
  INSERT INTO `prepaid_log` (`id`,`value`,`text`,`days`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`value`,OLD.`text`,OLD.`days`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for promotion
DROP TRIGGER IF EXISTS `promotion_after_insert`$$
CREATE TRIGGER `promotion_after_insert` AFTER INSERT ON `promotion`
FOR EACH ROW
BEGIN
  INSERT INTO `promotion_log` (`id`,`value`,`text`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`value`,NEW.`text`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `promotion_after_update`$$
CREATE TRIGGER `promotion_after_update` AFTER UPDATE ON `promotion`
FOR EACH ROW
BEGIN
  INSERT INTO `promotion_log` (`id`,`value`,`text`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`value`,NEW.`text`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `promotion_after_delete`$$
CREATE TRIGGER `promotion_after_delete` AFTER DELETE ON `promotion`
FOR EACH ROW
BEGIN
  INSERT INTO `promotion_log` (`id`,`value`,`text`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`value`,OLD.`text`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for reservation
DROP TRIGGER IF EXISTS `reservation_after_insert`$$
CREATE TRIGGER `reservation_after_insert` AFTER INSERT ON `reservation`
FOR EACH ROW
BEGIN
  INSERT INTO `reservation_log` (`id`,`reservationTypeId`,`invoiceStatusId`,`invoiceNumber`,`tourCompany`,`arrivalDateTime`,`arrivalFlight`,`bookingSource`,`departureDateTime`,`departureFlight`,`checkInDate`,`checkOutDate`,`noOfDays`,`depositAmount`,`depositAmountInCurrency`,`depositCurrency`,`depositDateUTC`,`depositPaymentMode`,`roomNo`,`isSingleOccupancy`,`noOfGuests`,`pickUpTypeId`,`pickUpFee`,`pickUpFeeCurrency`,`pickUpFeePaidOnUTC`,`pickUpCarNo`,`pickUpDriver`,`prepaidCode`,`prepaidPackageId`,`promotionPackageId`,`dropOffTypeId`,`dropOffFee`,`dropOffFeeCurrency`,`dropOffFeePaidOnUTC`,`dropOffCarNo`,`dropOffDriver`,`reservationStatusId`,`remark`,`paymentRemark`,`totalAmount`,`paidAmount`,`discountAmount`,`tax`,`taxAmount`,`netAmount`,`dueAmount`,`golfCart`,`location`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationTypeId`,NEW.`invoiceStatusId`,NEW.`invoiceNumber`,NEW.`tourCompany`,NEW.`arrivalDateTime`,NEW.`arrivalFlight`,NEW.`bookingSource`,NEW.`departureDateTime`,NEW.`departureFlight`,NEW.`checkInDate`,NEW.`checkOutDate`,NEW.`noOfDays`,NEW.`depositAmount`,NEW.`depositAmountInCurrency`,NEW.`depositCurrency`,NEW.`depositDateUTC`,NEW.`depositPaymentMode`,NEW.`roomNo`,NEW.`isSingleOccupancy`,NEW.`noOfGuests`,NEW.`pickUpTypeId`,NEW.`pickUpFee`,NEW.`pickUpFeeCurrency`,NEW.`pickUpFeePaidOnUTC`,NEW.`pickUpCarNo`,NEW.`pickUpDriver`,NEW.`prepaidCode`,NEW.`prepaidPackageId`,NEW.`promotionPackageId`,NEW.`dropOffTypeId`,NEW.`dropOffFee`,NEW.`dropOffFeeCurrency`,NEW.`dropOffFeePaidOnUTC`,NEW.`dropOffCarNo`,NEW.`dropOffDriver`,NEW.`reservationStatusId`,NEW.`remark`,NEW.`paymentRemark`,NEW.`totalAmount`,NEW.`paidAmount`,NEW.`discountAmount`,NEW.`tax`,NEW.`taxAmount`,NEW.`netAmount`,NEW.`dueAmount`,NEW.`golfCart`,NEW.`location`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `reservation_after_update`$$
CREATE TRIGGER `reservation_after_update` AFTER UPDATE ON `reservation`
FOR EACH ROW
BEGIN
  INSERT INTO `reservation_log` (`id`,`reservationTypeId`,`invoiceStatusId`,`invoiceNumber`,`tourCompany`,`arrivalDateTime`,`arrivalFlight`,`bookingSource`,`departureDateTime`,`departureFlight`,`checkInDate`,`checkOutDate`,`noOfDays`,`depositAmount`,`depositAmountInCurrency`,`depositCurrency`,`depositDateUTC`,`depositPaymentMode`,`roomNo`,`isSingleOccupancy`,`noOfGuests`,`pickUpTypeId`,`pickUpFee`,`pickUpFeeCurrency`,`pickUpFeePaidOnUTC`,`pickUpCarNo`,`pickUpDriver`,`prepaidCode`,`prepaidPackageId`,`promotionPackageId`,`dropOffTypeId`,`dropOffFee`,`dropOffFeeCurrency`,`dropOffFeePaidOnUTC`,`dropOffCarNo`,`dropOffDriver`,`reservationStatusId`,`remark`,`paymentRemark`,`totalAmount`,`paidAmount`,`discountAmount`,`tax`,`taxAmount`,`netAmount`,`dueAmount`,`golfCart`,`location`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationTypeId`,NEW.`invoiceStatusId`,NEW.`invoiceNumber`,NEW.`tourCompany`,NEW.`arrivalDateTime`,NEW.`arrivalFlight`,NEW.`bookingSource`,NEW.`departureDateTime`,NEW.`departureFlight`,NEW.`checkInDate`,NEW.`checkOutDate`,NEW.`noOfDays`,NEW.`depositAmount`,NEW.`depositAmountInCurrency`,NEW.`depositCurrency`,NEW.`depositDateUTC`,NEW.`depositPaymentMode`,NEW.`roomNo`,NEW.`isSingleOccupancy`,NEW.`noOfGuests`,NEW.`pickUpTypeId`,NEW.`pickUpFee`,NEW.`pickUpFeeCurrency`,NEW.`pickUpFeePaidOnUTC`,NEW.`pickUpCarNo`,NEW.`pickUpDriver`,NEW.`prepaidCode`,NEW.`prepaidPackageId`,NEW.`promotionPackageId`,NEW.`dropOffTypeId`,NEW.`dropOffFee`,NEW.`dropOffFeeCurrency`,NEW.`dropOffFeePaidOnUTC`,NEW.`dropOffCarNo`,NEW.`dropOffDriver`,NEW.`reservationStatusId`,NEW.`remark`,NEW.`paymentRemark`,NEW.`totalAmount`,NEW.`paidAmount`,NEW.`discountAmount`,NEW.`tax`,NEW.`taxAmount`,NEW.`netAmount`,NEW.`dueAmount`,NEW.`golfCart`,NEW.`location`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `reservation_after_delete`$$
CREATE TRIGGER `reservation_after_delete` AFTER DELETE ON `reservation`
FOR EACH ROW
BEGIN
  INSERT INTO `reservation_log` (`id`,`reservationTypeId`,`invoiceStatusId`,`invoiceNumber`,`tourCompany`,`arrivalDateTime`,`arrivalFlight`,`bookingSource`,`departureDateTime`,`departureFlight`,`checkInDate`,`checkOutDate`,`noOfDays`,`depositAmount`,`depositAmountInCurrency`,`depositCurrency`,`depositDateUTC`,`depositPaymentMode`,`roomNo`,`isSingleOccupancy`,`noOfGuests`,`pickUpTypeId`,`pickUpFee`,`pickUpFeeCurrency`,`pickUpFeePaidOnUTC`,`pickUpCarNo`,`pickUpDriver`,`prepaidCode`,`prepaidPackageId`,`promotionPackageId`,`dropOffTypeId`,`dropOffFee`,`dropOffFeeCurrency`,`dropOffFeePaidOnUTC`,`dropOffCarNo`,`dropOffDriver`,`reservationStatusId`,`remark`,`paymentRemark`,`totalAmount`,`paidAmount`,`discountAmount`,`tax`,`taxAmount`,`netAmount`,`dueAmount`,`golfCart`,`location`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`reservationTypeId`,OLD.`invoiceStatusId`,OLD.`invoiceNumber`,OLD.`tourCompany`,OLD.`arrivalDateTime`,OLD.`arrivalFlight`,OLD.`bookingSource`,OLD.`departureDateTime`,OLD.`departureFlight`,OLD.`checkInDate`,OLD.`checkOutDate`,OLD.`noOfDays`,OLD.`depositAmount`,OLD.`depositAmountInCurrency`,OLD.`depositCurrency`,OLD.`depositDateUTC`,OLD.`depositPaymentMode`,OLD.`roomNo`,OLD.`isSingleOccupancy`,OLD.`noOfGuests`,OLD.`pickUpTypeId`,OLD.`pickUpFee`,OLD.`pickUpFeeCurrency`,OLD.`pickUpFeePaidOnUTC`,OLD.`pickUpCarNo`,OLD.`pickUpDriver`,OLD.`prepaidCode`,OLD.`prepaidPackageId`,OLD.`promotionPackageId`,OLD.`dropOffTypeId`,OLD.`dropOffFee`,OLD.`dropOffFeeCurrency`,OLD.`dropOffFeePaidOnUTC`,OLD.`dropOffCarNo`,OLD.`dropOffDriver`,OLD.`reservationStatusId`,OLD.`remark`,OLD.`paymentRemark`,OLD.`totalAmount`,OLD.`paidAmount`,OLD.`discountAmount`,OLD.`tax`,OLD.`taxAmount`,OLD.`netAmount`,OLD.`dueAmount`,OLD.`golfCart`,OLD.`location`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for reservationCustomer
DROP TRIGGER IF EXISTS `reservationCustomer_after_insert`$$
CREATE TRIGGER `reservationCustomer_after_insert` AFTER INSERT ON `reservationCustomer`
FOR EACH ROW
BEGIN
  INSERT INTO `reservationCustomer_log` (`id`,`reservationId`,`customerId`,`tdacStatusId`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`customerId`,NEW.`tdacStatusId`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `reservationCustomer_after_update`$$
CREATE TRIGGER `reservationCustomer_after_update` AFTER UPDATE ON `reservationCustomer`
FOR EACH ROW
BEGIN
  INSERT INTO `reservationCustomer_log` (`id`,`reservationId`,`customerId`,`tdacStatusId`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`customerId`,NEW.`tdacStatusId`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `reservationCustomer_after_delete`$$
CREATE TRIGGER `reservationCustomer_after_delete` AFTER DELETE ON `reservationCustomer`
FOR EACH ROW
BEGIN
  INSERT INTO `reservationCustomer_log` (`id`,`reservationId`,`customerId`,`tdacStatusId`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`reservationId`,OLD.`customerId`,OLD.`tdacStatusId`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for room
DROP TRIGGER IF EXISTS `room_after_insert`$$
CREATE TRIGGER `room_after_insert` AFTER INSERT ON `room`
FOR EACH ROW
BEGIN
  INSERT INTO `room_log` (`id`,`roomNo`,`roomTypeId`,`isAvailable`,`location`,`zone`,`bedType`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`roomNo`,NEW.`roomTypeId`,NEW.`isAvailable`,NEW.`location`,NEW.`zone`,NEW.`bedType`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `room_after_update`$$
CREATE TRIGGER `room_after_update` AFTER UPDATE ON `room`
FOR EACH ROW
BEGIN
  INSERT INTO `room_log` (`id`,`roomNo`,`roomTypeId`,`isAvailable`,`location`,`zone`,`bedType`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`roomNo`,NEW.`roomTypeId`,NEW.`isAvailable`,NEW.`location`,NEW.`zone`,NEW.`bedType`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `room_after_delete`$$
CREATE TRIGGER `room_after_delete` AFTER DELETE ON `room`
FOR EACH ROW
BEGIN
  INSERT INTO `room_log` (`id`,`roomNo`,`roomTypeId`,`isAvailable`,`location`,`zone`,`bedType`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`roomNo`,OLD.`roomTypeId`,OLD.`isAvailable`,OLD.`location`,OLD.`zone`,OLD.`bedType`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for roomCharge
DROP TRIGGER IF EXISTS `roomCharge_after_insert`$$
CREATE TRIGGER `roomCharge_after_insert` AFTER INSERT ON `roomCharge`
FOR EACH ROW
BEGIN
  INSERT INTO `roomCharge_log` (`id`,`reservationId`,`startDate`,`endDate`,`roomId`,`roomTypeId`,`roomRate`,`roomSurcharge`,`singleRate`,`seasonSurcharge`,`extraBedRate`,`totalRate`,`noOfDays`,`totalAmount`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`startDate`,NEW.`endDate`,NEW.`roomId`,NEW.`roomTypeId`,NEW.`roomRate`,NEW.`roomSurcharge`,NEW.`singleRate`,NEW.`seasonSurcharge`,NEW.`extraBedRate`,NEW.`totalRate`,NEW.`noOfDays`,NEW.`totalAmount`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `roomCharge_after_update`$$
CREATE TRIGGER `roomCharge_after_update` AFTER UPDATE ON `roomCharge`
FOR EACH ROW
BEGIN
  INSERT INTO `roomCharge_log` (`id`,`reservationId`,`startDate`,`endDate`,`roomId`,`roomTypeId`,`roomRate`,`roomSurcharge`,`singleRate`,`seasonSurcharge`,`extraBedRate`,`totalRate`,`noOfDays`,`totalAmount`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`startDate`,NEW.`endDate`,NEW.`roomId`,NEW.`roomTypeId`,NEW.`roomRate`,NEW.`roomSurcharge`,NEW.`singleRate`,NEW.`seasonSurcharge`,NEW.`extraBedRate`,NEW.`totalRate`,NEW.`noOfDays`,NEW.`totalAmount`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `roomCharge_after_delete`$$
CREATE TRIGGER `roomCharge_after_delete` AFTER DELETE ON `roomCharge`
FOR EACH ROW
BEGIN
  INSERT INTO `roomCharge_log` (`id`,`reservationId`,`startDate`,`endDate`,`roomId`,`roomTypeId`,`roomRate`,`roomSurcharge`,`singleRate`,`seasonSurcharge`,`extraBedRate`,`totalRate`,`noOfDays`,`totalAmount`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`reservationId`,OLD.`startDate`,OLD.`endDate`,OLD.`roomId`,OLD.`roomTypeId`,OLD.`roomRate`,OLD.`roomSurcharge`,OLD.`singleRate`,OLD.`seasonSurcharge`,OLD.`extraBedRate`,OLD.`totalRate`,OLD.`noOfDays`,OLD.`totalAmount`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for roomReservation
DROP TRIGGER IF EXISTS `roomReservation_after_insert`$$
CREATE TRIGGER `roomReservation_after_insert` AFTER INSERT ON `roomReservation`
FOR EACH ROW
BEGIN
  INSERT INTO `roomReservation_log` (`id`,`roomId`,`reservationId`,`noOfExtraBed`,`checkInDate`,`checkOutDate`,`isSingleOccupancy`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`roomId`,NEW.`reservationId`,NEW.`noOfExtraBed`,NEW.`checkInDate`,NEW.`checkOutDate`,NEW.`isSingleOccupancy`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `roomReservation_after_update`$$
CREATE TRIGGER `roomReservation_after_update` AFTER UPDATE ON `roomReservation`
FOR EACH ROW
BEGIN
  INSERT INTO `roomReservation_log` (`id`,`roomId`,`reservationId`,`noOfExtraBed`,`checkInDate`,`checkOutDate`,`isSingleOccupancy`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`roomId`,NEW.`reservationId`,NEW.`noOfExtraBed`,NEW.`checkInDate`,NEW.`checkOutDate`,NEW.`isSingleOccupancy`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `roomReservation_after_delete`$$
CREATE TRIGGER `roomReservation_after_delete` AFTER DELETE ON `roomReservation`
FOR EACH ROW
BEGIN
  INSERT INTO `roomReservation_log` (`id`,`roomId`,`reservationId`,`noOfExtraBed`,`checkInDate`,`checkOutDate`,`isSingleOccupancy`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`roomId`,OLD.`reservationId`,OLD.`noOfExtraBed`,OLD.`checkInDate`,OLD.`checkOutDate`,OLD.`isSingleOccupancy`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for roomRate
DROP TRIGGER IF EXISTS `roomRate_after_insert`$$
CREATE TRIGGER `roomRate_after_insert` AFTER INSERT ON `roomRate`
FOR EACH ROW
BEGIN
  INSERT INTO `roomRate_log` (`id`,`roomTypeId`,`roomRate`,`singleRate`,`roomSurcharge`,`seasonSurcharge`,`extraBedRate`,`month`,`location`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`roomTypeId`,NEW.`roomRate`,NEW.`singleRate`,NEW.`roomSurcharge`,NEW.`seasonSurcharge`,NEW.`extraBedRate`,NEW.`month`,NEW.`location`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `roomRate_after_update`$$
CREATE TRIGGER `roomRate_after_update` AFTER UPDATE ON `roomRate`
FOR EACH ROW
BEGIN
  INSERT INTO `roomRate_log` (`id`,`roomTypeId`,`roomRate`,`singleRate`,`roomSurcharge`,`seasonSurcharge`,`extraBedRate`,`month`,`location`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`roomTypeId`,NEW.`roomRate`,NEW.`singleRate`,NEW.`roomSurcharge`,NEW.`seasonSurcharge`,NEW.`extraBedRate`,NEW.`month`,NEW.`location`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `roomRate_after_delete`$$
CREATE TRIGGER `roomRate_after_delete` AFTER DELETE ON `roomRate`
FOR EACH ROW
BEGIN
  INSERT INTO `roomRate_log` (`id`,`roomTypeId`,`roomRate`,`singleRate`,`roomSurcharge`,`seasonSurcharge`,`extraBedRate`,`month`,`location`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`roomTypeId`,OLD.`roomRate`,OLD.`singleRate`,OLD.`roomSurcharge`,OLD.`seasonSurcharge`,OLD.`extraBedRate`,OLD.`month`,OLD.`location`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for roomType
DROP TRIGGER IF EXISTS `roomType_after_insert`$$
CREATE TRIGGER `roomType_after_insert` AFTER INSERT ON `roomType`
FOR EACH ROW
BEGIN
  INSERT INTO `roomType_log` (`id`,`roomType`,`roomTypeText`,`maxOccupancy`,`isDoubleBed`,`location`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`roomType`,NEW.`roomTypeText`,NEW.`maxOccupancy`,NEW.`isDoubleBed`,NEW.`location`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `roomType_after_update`$$
CREATE TRIGGER `roomType_after_update` AFTER UPDATE ON `roomType`
FOR EACH ROW
BEGIN
  INSERT INTO `roomType_log` (`id`,`roomType`,`roomTypeText`,`maxOccupancy`,`isDoubleBed`,`location`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`roomType`,NEW.`roomTypeText`,NEW.`maxOccupancy`,NEW.`isDoubleBed`,NEW.`location`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `roomType_after_delete`$$
CREATE TRIGGER `roomType_after_delete` AFTER DELETE ON `roomType`
FOR EACH ROW
BEGIN
  INSERT INTO `roomType_log` (`id`,`roomType`,`roomTypeText`,`maxOccupancy`,`isDoubleBed`,`location`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`roomType`,OLD.`roomTypeText`,OLD.`maxOccupancy`,OLD.`isDoubleBed`,OLD.`location`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for user
DROP TRIGGER IF EXISTS `user_after_insert`$$
CREATE TRIGGER `user_after_insert` AFTER INSERT ON `user`
FOR EACH ROW
BEGIN
  INSERT INTO `user_log` (`id`,`name`,`userName`,`email`,`password`,`role`,`location`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`name`,NEW.`userName`,NEW.`email`,NEW.`password`,NEW.`role`,NEW.`location`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `user_after_update`$$
CREATE TRIGGER `user_after_update` AFTER UPDATE ON `user`
FOR EACH ROW
BEGIN
  INSERT INTO `user_log` (`id`,`name`,`userName`,`email`,`password`,`role`,`location`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`name`,NEW.`userName`,NEW.`email`,NEW.`password`,NEW.`role`,NEW.`location`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `user_after_delete`$$
CREATE TRIGGER `user_after_delete` AFTER DELETE ON `user`
FOR EACH ROW
BEGIN
  INSERT INTO `user_log` (`id`,`name`,`userName`,`email`,`password`,`role`,`location`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`name`,OLD.`userName`,OLD.`email`,OLD.`password`,OLD.`role`,OLD.`location`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for version
DROP TRIGGER IF EXISTS `version_after_insert`$$
CREATE TRIGGER `version_after_insert` AFTER INSERT ON `version`
FOR EACH ROW
BEGIN
  INSERT INTO `version_log` (`id`,`version`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`version`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `version_after_update`$$
CREATE TRIGGER `version_after_update` AFTER UPDATE ON `version`
FOR EACH ROW
BEGIN
  INSERT INTO `version_log` (`id`,`version`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`version`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `version_after_delete`$$
CREATE TRIGGER `version_after_delete` AFTER DELETE ON `version`
FOR EACH ROW
BEGIN
  INSERT INTO `version_log` (`id`,`version`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`version`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

DELIMITER ;
