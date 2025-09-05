ALTER TABLE `reservation` RENAME COLUMN `arrivalDateTimeUTC` TO `arrivalDateTime`;
ALTER TABLE `reservation` RENAME COLUMN `departureDateTimeUTC` TO `departureDateTime`;
ALTER TABLE `reservation` RENAME COLUMN `checkInDateUTC` TO `checkInDate`;
ALTER TABLE `reservation` RENAME COLUMN `checkOutDateUTC` TO `checkOutDate`;
ALTER TABLE `roomCharge` RENAME COLUMN `startDateUTC` TO `startDate`;
ALTER TABLE `roomCharge` RENAME COLUMN `endDateUTC` TO `endDate`;
ALTER TABLE `roomReservation` RENAME COLUMN `checkInDateUTC` TO `checkInDate`;
ALTER TABLE `roomReservation` RENAME COLUMN `checkOutDateUTC` TO `checkOutDate`;