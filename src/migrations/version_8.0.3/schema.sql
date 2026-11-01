ALTER TABLE `customer` ADD `emergencyContactName` varchar(255);
ALTER TABLE `customer` ADD `emergencyContactPhone` varchar(50);
ALTER TABLE `customer` ADD `emergencyContactRelation` varchar(100);
ALTER TABLE `customer` ADD `companyName` varchar(255);
ALTER TABLE `customer` ADD `position` varchar(255);
ALTER TABLE `customer` ADD `handicap` varchar(255);
ALTER TABLE `customer` ADD `homeClub` varchar(255);
ALTER TABLE `customer` ADD `yearsPlaying` varchar(255);
ALTER TABLE `customer` ADD `playingHand` varchar(255);
ALTER TABLE `customer` ADD `caddiePreference` varchar(255);
ALTER TABLE `customer` ADD `numberOfPlayers` varchar(255);
ALTER TABLE `customer` ADD `bookingChannel` varchar(255);
ALTER TABLE `customer` ADD `visitPurpose` varchar(255);
ALTER TABLE `customer` ADD `membershipStatus` varchar(255);
ALTER TABLE `customer` ADD `membershipNo` varchar(255);
ALTER TABLE `customer` ADD `introducedBy` varchar(255);
ALTER TABLE `customer` ADD `interestedInMembership` varchar(255);
ALTER TABLE `customer` ADD `foodAllergy` varchar(255);
ALTER TABLE `customer` ADD `drink` varchar(255);
ALTER TABLE `customer` ADD `preferredTeeTime` varchar(100);
ALTER TABLE `customer` ADD `language` varchar(100);
ALTER TABLE `customer` ADD `specialNote` varchar(1024);
ALTER TABLE `customer` ADD `medicalConditions` varchar(1024);
ALTER TABLE `customer` ADD `pacemakerStent` varchar(255);
ALTER TABLE `customer` ADD `regularMedication` varchar(1024);
ALTER TABLE `customer` ADD `drugAllergy` varchar(1024);
ALTER TABLE `customer` ADD `walkingTheCourse` varchar(255);
ALTER TABLE `customer` ADD `dizzyShortOfBreathWhenWalking` varchar(255);
ALTER TABLE `customer` ADD `doctorNamePhone` varchar(255);

ALTER TABLE `customer_log` ADD `emergencyContactName` varchar(255);
ALTER TABLE `customer_log` ADD `emergencyContactPhone` varchar(50);
ALTER TABLE `customer_log` ADD `emergencyContactRelation` varchar(100);
ALTER TABLE `customer_log` ADD `companyName` varchar(255);
ALTER TABLE `customer_log` ADD `position` varchar(255);
ALTER TABLE `customer_log` ADD `handicap` varchar(255);
ALTER TABLE `customer_log` ADD `homeClub` varchar(255);
ALTER TABLE `customer_log` ADD `yearsPlaying` varchar(255);
ALTER TABLE `customer_log` ADD `playingHand` varchar(255);
ALTER TABLE `customer_log` ADD `caddiePreference` varchar(255);
ALTER TABLE `customer_log` ADD `numberOfPlayers` varchar(255);
ALTER TABLE `customer_log` ADD `bookingChannel` varchar(255);
ALTER TABLE `customer_log` ADD `visitPurpose` varchar(255);
ALTER TABLE `customer_log` ADD `membershipStatus` varchar(255);
ALTER TABLE `customer_log` ADD `membershipNo` varchar(255);
ALTER TABLE `customer_log` ADD `introducedBy` varchar(255);
ALTER TABLE `customer_log` ADD `interestedInMembership` varchar(255);
ALTER TABLE `customer_log` ADD `foodAllergy` varchar(255);
ALTER TABLE `customer_log` ADD `drink` varchar(255);
ALTER TABLE `customer_log` ADD `preferredTeeTime` varchar(100);
ALTER TABLE `customer_log` ADD `language` varchar(100);
ALTER TABLE `customer_log` ADD `specialNote` varchar(1024);
ALTER TABLE `customer_log` ADD `medicalConditions` varchar(1024);
ALTER TABLE `customer_log` ADD `pacemakerStent` varchar(255);
ALTER TABLE `customer_log` ADD `regularMedication` varchar(1024);
ALTER TABLE `customer_log` ADD `drugAllergy` varchar(1024);
ALTER TABLE `customer_log` ADD `walkingTheCourse` varchar(255);
ALTER TABLE `customer_log` ADD `dizzyShortOfBreathWhenWalking` varchar(255);
ALTER TABLE `customer_log` ADD `doctorNamePhone` varchar(255);

DELIMITER $$

DROP TRIGGER IF EXISTS `customer_after_insert`$$
CREATE TRIGGER `customer_after_insert` AFTER INSERT ON `customer`
FOR EACH ROW
BEGIN
	INSERT INTO `customer_log` (`id`,`name`,`englishName`,`dob`,`passport`,`nationalId`,`gender`,`address`,`remarks`,`country`,`phone`,`email`,`emergencyContactName`,`emergencyContactPhone`,`emergencyContactRelation`,`companyName`,`position`,`handicap`,`homeClub`,`yearsPlaying`,`playingHand`,`caddiePreference`,`numberOfPlayers`,`bookingChannel`,`visitPurpose`,`membershipStatus`,`membershipNo`,`introducedBy`,`interestedInMembership`,`foodAllergy`,`drink`,`preferredTeeTime`,`language`,`specialNote`,`medicalConditions`,`pacemakerStent`,`regularMedication`,`drugAllergy`,`walkingTheCourse`,`dizzyShortOfBreathWhenWalking`,`doctorNamePhone`,`isBlackListed`,`isDeleted`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
	VALUES (NEW.`id`,NEW.`name`,NEW.`englishName`,NEW.`dob`,NEW.`passport`,NEW.`nationalId`,NEW.`gender`,NEW.`address`,NEW.`remarks`,NEW.`country`,NEW.`phone`,NEW.`email`,NEW.`emergencyContactName`,NEW.`emergencyContactPhone`,NEW.`emergencyContactRelation`,NEW.`companyName`,NEW.`position`,NEW.`handicap`,NEW.`homeClub`,NEW.`yearsPlaying`,NEW.`playingHand`,NEW.`caddiePreference`,NEW.`numberOfPlayers`,NEW.`bookingChannel`,NEW.`visitPurpose`,NEW.`membershipStatus`,NEW.`membershipNo`,NEW.`introducedBy`,NEW.`interestedInMembership`,NEW.`foodAllergy`,NEW.`drink`,NEW.`preferredTeeTime`,NEW.`language`,NEW.`specialNote`,NEW.`medicalConditions`,NEW.`pacemakerStent`,NEW.`regularMedication`,NEW.`drugAllergy`,NEW.`walkingTheCourse`,NEW.`dizzyShortOfBreathWhenWalking`,NEW.`doctorNamePhone`,NEW.`isBlackListed`,NEW.`isDeleted`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `customer_after_update`$$
CREATE TRIGGER `customer_after_update` AFTER UPDATE ON `customer`
FOR EACH ROW
BEGIN
	INSERT INTO `customer_log` (`id`,`name`,`englishName`,`dob`,`passport`,`nationalId`,`gender`,`address`,`remarks`,`country`,`phone`,`email`,`emergencyContactName`,`emergencyContactPhone`,`emergencyContactRelation`,`companyName`,`position`,`handicap`,`homeClub`,`yearsPlaying`,`playingHand`,`caddiePreference`,`numberOfPlayers`,`bookingChannel`,`visitPurpose`,`membershipStatus`,`membershipNo`,`introducedBy`,`interestedInMembership`,`foodAllergy`,`drink`,`preferredTeeTime`,`language`,`specialNote`,`medicalConditions`,`pacemakerStent`,`regularMedication`,`drugAllergy`,`walkingTheCourse`,`dizzyShortOfBreathWhenWalking`,`doctorNamePhone`,`isBlackListed`,`isDeleted`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
	VALUES (NEW.`id`,NEW.`name`,NEW.`englishName`,NEW.`dob`,NEW.`passport`,NEW.`nationalId`,NEW.`gender`,NEW.`address`,NEW.`remarks`,NEW.`country`,NEW.`phone`,NEW.`email`,NEW.`emergencyContactName`,NEW.`emergencyContactPhone`,NEW.`emergencyContactRelation`,NEW.`companyName`,NEW.`position`,NEW.`handicap`,NEW.`homeClub`,NEW.`yearsPlaying`,NEW.`playingHand`,NEW.`caddiePreference`,NEW.`numberOfPlayers`,NEW.`bookingChannel`,NEW.`visitPurpose`,NEW.`membershipStatus`,NEW.`membershipNo`,NEW.`introducedBy`,NEW.`interestedInMembership`,NEW.`foodAllergy`,NEW.`drink`,NEW.`preferredTeeTime`,NEW.`language`,NEW.`specialNote`,NEW.`medicalConditions`,NEW.`pacemakerStent`,NEW.`regularMedication`,NEW.`drugAllergy`,NEW.`walkingTheCourse`,NEW.`dizzyShortOfBreathWhenWalking`,NEW.`doctorNamePhone`,NEW.`isBlackListed`,NEW.`isDeleted`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `customer_after_delete`$$
CREATE TRIGGER `customer_after_delete` AFTER DELETE ON `customer`
FOR EACH ROW
BEGIN
	INSERT INTO `customer_log` (`id`,`name`,`englishName`,`dob`,`passport`,`nationalId`,`gender`,`address`,`remarks`,`country`,`phone`,`email`,`emergencyContactName`,`emergencyContactPhone`,`emergencyContactRelation`,`companyName`,`position`,`handicap`,`homeClub`,`yearsPlaying`,`playingHand`,`caddiePreference`,`numberOfPlayers`,`bookingChannel`,`visitPurpose`,`membershipStatus`,`membershipNo`,`introducedBy`,`interestedInMembership`,`foodAllergy`,`drink`,`preferredTeeTime`,`language`,`specialNote`,`medicalConditions`,`pacemakerStent`,`regularMedication`,`drugAllergy`,`walkingTheCourse`,`dizzyShortOfBreathWhenWalking`,`doctorNamePhone`,`isBlackListed`,`isDeleted`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
	VALUES (OLD.`id`,OLD.`name`,OLD.`englishName`,OLD.`dob`,OLD.`passport`,OLD.`nationalId`,OLD.`gender`,OLD.`address`,OLD.`remarks`,OLD.`country`,OLD.`phone`,OLD.`email`,OLD.`emergencyContactName`,OLD.`emergencyContactPhone`,OLD.`emergencyContactRelation`,OLD.`companyName`,OLD.`position`,OLD.`handicap`,OLD.`homeClub`,OLD.`yearsPlaying`,OLD.`playingHand`,OLD.`caddiePreference`,OLD.`numberOfPlayers`,OLD.`bookingChannel`,OLD.`visitPurpose`,OLD.`membershipStatus`,OLD.`membershipNo`,OLD.`introducedBy`,OLD.`interestedInMembership`,OLD.`foodAllergy`,OLD.`drink`,OLD.`preferredTeeTime`,OLD.`language`,OLD.`specialNote`,OLD.`medicalConditions`,OLD.`pacemakerStent`,OLD.`regularMedication`,OLD.`drugAllergy`,OLD.`walkingTheCourse`,OLD.`dizzyShortOfBreathWhenWalking`,OLD.`doctorNamePhone`,OLD.`isBlackListed`,OLD.`isDeleted`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

DELIMITER ;