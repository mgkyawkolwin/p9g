ALTER TABLE `customer` ADD `visitedMyanmarBefore` varchar(255);
ALTER TABLE `customer` ADD `myanmarVisitNo` varchar(255);
ALTER TABLE `customer` ADD `previousMyanmarVisit` varchar(1024);
ALTER TABLE `customer` ADD `myanmarInterest` varchar(1024);
ALTER TABLE `customer` ADD `myanmarPlacesToVisit` varchar(1024);

ALTER TABLE `customer_log` ADD `visitedMyanmarBefore` varchar(255);
ALTER TABLE `customer_log` ADD `myanmarVisitNo` varchar(255);
ALTER TABLE `customer_log` ADD `previousMyanmarVisit` varchar(1024);
ALTER TABLE `customer_log` ADD `myanmarInterest` varchar(1024);
ALTER TABLE `customer_log` ADD `myanmarPlacesToVisit` varchar(1024);

DELIMITER $$

DROP TRIGGER IF EXISTS `customer_after_insert`$$
CREATE TRIGGER `customer_after_insert` AFTER INSERT ON `customer`
FOR EACH ROW
BEGIN
	INSERT INTO `customer_log` (`id`,`name`,`englishName`,`dob`,`passport`,`nationalId`,`gender`,`address`,`remarks`,`country`,`phone`,`email`,`emergencyContactName`,`emergencyContactPhone`,`emergencyContactRelation`,`companyName`,`position`,`handicap`,`homeClub`,`yearsPlaying`,`playingHand`,`caddiePreference`,`numberOfPlayers`,`bookingChannel`,`visitPurpose`,`membershipStatus`,`membershipNo`,`introducedBy`,`interestedInMembership`,`foodAllergy`,`drink`,`preferredTeeTime`,`language`,`specialNote`,`medicalConditions`,`pacemakerStent`,`regularMedication`,`drugAllergy`,`walkingTheCourse`,`dizzyShortOfBreathWhenWalking`,`doctorNamePhone`,`visitedMyanmarBefore`,`myanmarVisitNo`,`previousMyanmarVisit`,`myanmarInterest`,`myanmarPlacesToVisit`,`isBlackListed`,`isDeleted`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
	VALUES (NEW.`id`,NEW.`name`,NEW.`englishName`,NEW.`dob`,NEW.`passport`,NEW.`nationalId`,NEW.`gender`,NEW.`address`,NEW.`remarks`,NEW.`country`,NEW.`phone`,NEW.`email`,NEW.`emergencyContactName`,NEW.`emergencyContactPhone`,NEW.`emergencyContactRelation`,NEW.`companyName`,NEW.`position`,NEW.`handicap`,NEW.`homeClub`,NEW.`yearsPlaying`,NEW.`playingHand`,NEW.`caddiePreference`,NEW.`numberOfPlayers`,NEW.`bookingChannel`,NEW.`visitPurpose`,NEW.`membershipStatus`,NEW.`membershipNo`,NEW.`introducedBy`,NEW.`interestedInMembership`,NEW.`foodAllergy`,NEW.`drink`,NEW.`preferredTeeTime`,NEW.`language`,NEW.`specialNote`,NEW.`medicalConditions`,NEW.`pacemakerStent`,NEW.`regularMedication`,NEW.`drugAllergy`,NEW.`walkingTheCourse`,NEW.`dizzyShortOfBreathWhenWalking`,NEW.`doctorNamePhone`,NEW.`visitedMyanmarBefore`,NEW.`myanmarVisitNo`,NEW.`previousMyanmarVisit`,NEW.`myanmarInterest`,NEW.`myanmarPlacesToVisit`,NEW.`isBlackListed`,NEW.`isDeleted`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `customer_after_update`$$
CREATE TRIGGER `customer_after_update` AFTER UPDATE ON `customer`
FOR EACH ROW
BEGIN
	INSERT INTO `customer_log` (`id`,`name`,`englishName`,`dob`,`passport`,`nationalId`,`gender`,`address`,`remarks`,`country`,`phone`,`email`,`emergencyContactName`,`emergencyContactPhone`,`emergencyContactRelation`,`companyName`,`position`,`handicap`,`homeClub`,`yearsPlaying`,`playingHand`,`caddiePreference`,`numberOfPlayers`,`bookingChannel`,`visitPurpose`,`membershipStatus`,`membershipNo`,`introducedBy`,`interestedInMembership`,`foodAllergy`,`drink`,`preferredTeeTime`,`language`,`specialNote`,`medicalConditions`,`pacemakerStent`,`regularMedication`,`drugAllergy`,`walkingTheCourse`,`dizzyShortOfBreathWhenWalking`,`doctorNamePhone`,`visitedMyanmarBefore`,`myanmarVisitNo`,`previousMyanmarVisit`,`myanmarInterest`,`myanmarPlacesToVisit`,`isBlackListed`,`isDeleted`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
	VALUES (NEW.`id`,NEW.`name`,NEW.`englishName`,NEW.`dob`,NEW.`passport`,NEW.`nationalId`,NEW.`gender`,NEW.`address`,NEW.`remarks`,NEW.`country`,NEW.`phone`,NEW.`email`,NEW.`emergencyContactName`,NEW.`emergencyContactPhone`,NEW.`emergencyContactRelation`,NEW.`companyName`,NEW.`position`,NEW.`handicap`,NEW.`homeClub`,NEW.`yearsPlaying`,NEW.`playingHand`,NEW.`caddiePreference`,NEW.`numberOfPlayers`,NEW.`bookingChannel`,NEW.`visitPurpose`,NEW.`membershipStatus`,NEW.`membershipNo`,NEW.`introducedBy`,NEW.`interestedInMembership`,NEW.`foodAllergy`,NEW.`drink`,NEW.`preferredTeeTime`,NEW.`language`,NEW.`specialNote`,NEW.`medicalConditions`,NEW.`pacemakerStent`,NEW.`regularMedication`,NEW.`drugAllergy`,NEW.`walkingTheCourse`,NEW.`dizzyShortOfBreathWhenWalking`,NEW.`doctorNamePhone`,NEW.`visitedMyanmarBefore`,NEW.`myanmarVisitNo`,NEW.`previousMyanmarVisit`,NEW.`myanmarInterest`,NEW.`myanmarPlacesToVisit`,NEW.`isBlackListed`,NEW.`isDeleted`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `customer_after_delete`$$
CREATE TRIGGER `customer_after_delete` AFTER DELETE ON `customer`
FOR EACH ROW
BEGIN
	INSERT INTO `customer_log` (`id`,`name`,`englishName`,`dob`,`passport`,`nationalId`,`gender`,`address`,`remarks`,`country`,`phone`,`email`,`emergencyContactName`,`emergencyContactPhone`,`emergencyContactRelation`,`companyName`,`position`,`handicap`,`homeClub`,`yearsPlaying`,`playingHand`,`caddiePreference`,`numberOfPlayers`,`bookingChannel`,`visitPurpose`,`membershipStatus`,`membershipNo`,`introducedBy`,`interestedInMembership`,`foodAllergy`,`drink`,`preferredTeeTime`,`language`,`specialNote`,`medicalConditions`,`pacemakerStent`,`regularMedication`,`drugAllergy`,`walkingTheCourse`,`dizzyShortOfBreathWhenWalking`,`doctorNamePhone`,`visitedMyanmarBefore`,`myanmarVisitNo`,`previousMyanmarVisit`,`myanmarInterest`,`myanmarPlacesToVisit`,`isBlackListed`,`isDeleted`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
	VALUES (OLD.`id`,OLD.`name`,OLD.`englishName`,OLD.`dob`,OLD.`passport`,OLD.`nationalId`,OLD.`gender`,OLD.`address`,OLD.`remarks`,OLD.`country`,OLD.`phone`,OLD.`email`,OLD.`emergencyContactName`,OLD.`emergencyContactPhone`,OLD.`emergencyContactRelation`,OLD.`companyName`,OLD.`position`,OLD.`handicap`,OLD.`homeClub`,OLD.`yearsPlaying`,OLD.`playingHand`,OLD.`caddiePreference`,OLD.`numberOfPlayers`,OLD.`bookingChannel`,OLD.`visitPurpose`,OLD.`membershipStatus`,OLD.`membershipNo`,OLD.`introducedBy`,OLD.`interestedInMembership`,OLD.`foodAllergy`,OLD.`drink`,OLD.`preferredTeeTime`,OLD.`language`,OLD.`specialNote`,OLD.`medicalConditions`,OLD.`pacemakerStent`,OLD.`regularMedication`,OLD.`drugAllergy`,OLD.`walkingTheCourse`,OLD.`dizzyShortOfBreathWhenWalking`,OLD.`doctorNamePhone`,OLD.`visitedMyanmarBefore`,OLD.`myanmarVisitNo`,OLD.`previousMyanmarVisit`,OLD.`myanmarInterest`,OLD.`myanmarPlacesToVisit`,OLD.`isBlackListed`,OLD.`isDeleted`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

DELIMITER ;