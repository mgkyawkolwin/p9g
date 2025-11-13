CREATE TABLE `pookie` (
	`id` char(36) NOT NULL,
	`date` datetime(3) NOT NULL,
	`hole` varchar(10) NOT NULL,
	`isBusy` boolean NOT NULL,
	`location` varchar(10) NOT NULL,
	`noOfPeople` tinyint NOT NULL,
	`rooms` varchar(50) NOT NULL,
	`time` datetime(3) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `pookie_id` PRIMARY KEY(`id`)
);

CREATE TABLE `pookieConfig` (
	`id` char(36) NOT NULL,
	`contactUrl` varchar(500) NOT NULL,
	`key` char(36) NOT NULL,
	`version` varchar(10) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `pookieConfig_id` PRIMARY KEY(`id`)
);

CREATE TABLE `pookieDevice` (
	`id` char(36) NOT NULL,
	`deviceId` varchar(50) NOT NULL,
	`isBlocked` boolean NOT NULL,
	`lastRequestAtUTC` datetime(3) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `pookieDevice_id` PRIMARY KEY(`id`)
);