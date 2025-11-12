CREATE TABLE `pookieConfig` (
	`id` char(36) NOT NULL,
	`key` char(36) NOT NULL,
	`version` varchar(10) NOT NULL,
	`createdAtUTC` datetime(3) NOT NULL,
	`createdBy` char(36) NOT NULL,
	`updatedAtUTC` datetime(3) NOT NULL,
	`updatedBy` char(36) NOT NULL,
	CONSTRAINT `pookieConfig_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
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
