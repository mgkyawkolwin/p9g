ALTER TABLE `prepaidPackage` ADD `packageStatus` varchar(10) DEFAULT 'New' NOT NULL;--> statement-breakpoint
ALTER TABLE `prepaidPackage` ADD `paymentStatus` varchar(10) DEFAULT 'Unpaid' NOT NULL;
--> statement-breakpoint
UPDATE `prepaidPackage`
SET
	`paymentStatus` = CASE WHEN `balance` = 0 THEN 'Paid' ELSE 'Unpaid' END,
	`packageStatus` = CASE
		WHEN `daysUsed` = 0 THEN 'New'
		WHEN `daysUsed` >= `noOfDays` THEN 'Finished'
		ELSE 'In Use'
	END;