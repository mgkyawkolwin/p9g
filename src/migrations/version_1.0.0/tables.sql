-- Adminer 5.3.0 MySQL 8.4.5 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

DELIMITER ;;

DROP PROCEDURE IF EXISTS `pUserList`;;
CREATE PROCEDURE `pUserList` (IN `searchColumn` varchar(20), IN `searchValue` varchar(50), IN `sortColumn` varchar(20), IN `sortOrder` varchar(4), IN `currentPage` tinyint, IN `pageSize` tinyint, OUT `firstPage` tinyint, OUT `lastPage` tinyint)
BEGIN

DECLARE offsetValue INT;
DECLARE totalRecord INT;
SET sortColumn = IFNULL(sortColumn, 'id');
SET sortOrder = IFNULL(sortOrder, 'ASC');

SET totalRecord = (SELECT COUNT(*) FROM user
WHERE searchColumn IS NULL OR searchColumn = searchValue);

SET firstPage = 1;
SET lastPage = CEIL(totalRecord/pageSize);
SET offsetValue = (currentPage - 1) * pageSize;

SELECT * FROM user
WHERE searchColumn IS NULL OR searchColumn = searchValue
ORDER BY `name`
LIMIT offsetValue, pageSize;

END;;

DELIMITER ;

SET NAMES utf8mb4;

CREATE TABLE `__drizzle_migrations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `hash` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `bill` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dateUTC` datetime NOT NULL,
  `paymentType` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentMode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reservationId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `itemName` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unitPrice` decimal(10,0) NOT NULL,
  `quantity` tinyint NOT NULL,
  `amount` decimal(10,0) NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isPaid` bit(1) NOT NULL,
  `paidOnUTC` datetime DEFAULT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `config` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `group` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `customer` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `englishName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dob` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `passport` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nationalId` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_passport_unique` (`passport`),
  UNIQUE KEY `customer_nationalId_unique` (`nationalId`),
  UNIQUE KEY `customer_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `logError` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `datetime` datetime NOT NULL,
  `userId` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detail` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `payment` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reservationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentType` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentDateUTC` datetime NOT NULL,
  `amount` decimal(10,0) NOT NULL,
  `amountInCurrency` decimal(10,0) NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentMode` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remark` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `prepaid` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `days` tinyint NOT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `promotion` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `reservation` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'uuid()',
  `reservationTypeId` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `promotionPackageId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prepaidPackageId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tourCompany` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `arrivalDateTimeUTC` datetime DEFAULT NULL,
  `arrivalFlight` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departureDateTimeUTC` datetime DEFAULT NULL,
  `departureFlight` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `checkInDateUTC` datetime DEFAULT NULL,
  `checkOutDateUTC` datetime DEFAULT NULL,
  `noOfDays` smallint DEFAULT NULL,
  `depositAmount` decimal(10,0) DEFAULT NULL,
  `depositAmountInCurrency` decimal(10,0) DEFAULT NULL,
  `depositCurrency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `depositDateUTC` datetime DEFAULT NULL,
  `roomNo` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isSingleOccupancy` tinyint(1) DEFAULT NULL,
  `noOfGuests` tinyint DEFAULT NULL,
  `pickUpTypeId` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickUpFee` tinyint DEFAULT NULL,
  `pickUpFeeCurrency` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickUpFeePaidOnUTC` datetime DEFAULT NULL,
  `pickUpCarNo` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pickUpDriver` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dropOffTypeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dropOffFee` tinyint DEFAULT NULL,
  `dropOffFeeCurrency` char(3) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dropOffFeePaidOnUTC` datetime DEFAULT NULL,
  `dropOffCarNo` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dropOffDriver` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reservationStatusId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `paidAmount` decimal(10,2) NOT NULL,
  `discountAmount` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL,
  `taxAmount` decimal(10,2) NOT NULL,
  `netAmount` decimal(10,2) NOT NULL,
  `dueAmount` decimal(10,2) NOT NULL,
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `paymentMode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rsvNo` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reservation_reservationStatusId_config_id_fk` (`reservationStatusId`),
  CONSTRAINT `reservation_reservationStatusId_config_id_fk` FOREIGN KEY (`reservationStatusId`) REFERENCES `config` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `reservationCustomer` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reservationId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customerId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `room` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomTypeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomNo` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `isAvailable` tinyint(1) NOT NULL DEFAULT '1',
  `location` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `roomTypeId` (`roomTypeId`),
  CONSTRAINT `room_ibfk_1` FOREIGN KEY (`roomTypeId`) REFERENCES `roomType` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `roomCharge` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reservationId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `startDateUTC` datetime NOT NULL,
  `endDateUTC` datetime NOT NULL,
  `roomId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomTypeId` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomRate` decimal(10,0) NOT NULL,
  `singleRate` decimal(10,0) NOT NULL,
  `roomSurcharge` decimal(10,0) NOT NULL,
  `seasonSurcharge` decimal(10,0) NOT NULL,
  `extraBedRate` decimal(10,0) NOT NULL,
  `totalRate` decimal(10,0) NOT NULL,
  `noOfDays` tinyint NOT NULL,
  `totalAmount` decimal(10,0) NOT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `roomRate` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '(uuid())',
  `roomTypeId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomRate` decimal(10,2) NOT NULL,
  `singleRate` decimal(10,2) NOT NULL,
  `roomSurcharge` decimal(10,2) NOT NULL,
  `seasonSurcharge` decimal(10,2) NOT NULL,
  `extraBedRate` decimal(10,2) NOT NULL,
  `month` tinyint NOT NULL,
  `location` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `roomReservation` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reservationId` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `noOfExtraBed` tinyint DEFAULT NULL,
  `checkInDateUTC` datetime NOT NULL,
  `checkOutDateUTC` datetime NOT NULL,
  `isSingleOccupancy` bit(1) DEFAULT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `roomType` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomType` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roomTypeText` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `maxOccupancy` tinyint NOT NULL,
  `isDoubleBed` bit(1) NOT NULL,
  `location` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `user` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAtUTC` datetime NOT NULL,
  `createdBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updatedAtUTC` datetime NOT NULL,
  `updatedBy` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_userName_unique` (`userName`),
  UNIQUE KEY `user_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2025-08-01 02:42:52 UTC
