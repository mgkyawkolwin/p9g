ALTER TABLE `customer` ADD `isBlackListed` boolean DEFAULT false NOT NULL;
ALTER TABLE `customer` ADD `isDeleted` boolean DEFAULT false NOT NULL;
ALTER TABLE `reservation` ADD `paymentRemark` varchar(500);