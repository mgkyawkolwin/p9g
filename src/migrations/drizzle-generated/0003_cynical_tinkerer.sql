ALTER TABLE `reservation` RENAME COLUMN `arrivalDateTimeUTC` TO `arrivalDateTime`;--> statement-breakpoint
ALTER TABLE `reservation` RENAME COLUMN `departureDateTimeUTC` TO `departureDateTime`;--> statement-breakpoint
ALTER TABLE `reservation` RENAME COLUMN `checkInDateUTC` TO `checkInDate`;--> statement-breakpoint
ALTER TABLE `reservation` RENAME COLUMN `checkOutDateUTC` TO `checkOutDate`;--> statement-breakpoint
ALTER TABLE `roomCharge` RENAME COLUMN `startDateUTC` TO `startDate`;--> statement-breakpoint
ALTER TABLE `roomCharge` RENAME COLUMN `endDateUTC` TO `endDate`;--> statement-breakpoint
ALTER TABLE `roomReservation` RENAME COLUMN `checkInDateUTC` TO `checkInDate`;--> statement-breakpoint
ALTER TABLE `roomReservation` RENAME COLUMN `checkOutDateUTC` TO `checkOutDate`;