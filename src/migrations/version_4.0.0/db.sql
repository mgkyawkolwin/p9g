CREATE TABLE `pookie` (
	`id` char(36) NOT NULL,
	`date` datetime NOT NULL,
	`hole` varchar(10) NOT NULL,
	`isBusy` boolean NOT NULL,
	`rooms` varchar(100) NOT NULL,
	`time` datetime NOT NULL,
    `location` varchar(10) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `pookie_id` PRIMARY KEY(`id`)
);
