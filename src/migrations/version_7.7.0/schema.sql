ALTER TABLE `pookie` ADD `rowVersion` char(36) NOT NULL;
ALTER TABLE `pookie_log` ADD `rowVersion` char(36) NOT NULL;
UPDATE pookie SET rowVersion = UUID();



DELIMITER $$
-- Triggers for pookie
DROP TRIGGER IF EXISTS `pookie_after_insert`$$
CREATE TRIGGER `pookie_after_insert` AFTER INSERT ON `pookie`
FOR EACH ROW
BEGIN
  INSERT INTO `pookie_log` (`id`,`date`,`hole`,`isBusy`,`location`,`noOfPeople`,`rooms`,`time`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`, `rowVersion`)
  VALUES (NEW.`id`,NEW.`date`,NEW.`hole`,NEW.`isBusy`,NEW.`location`,NEW.`noOfPeople`,NEW.`rooms`,NEW.`time`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT', NEW.`rowVersion`);
END$$

DROP TRIGGER IF EXISTS `pookie_after_update`$$
CREATE TRIGGER `pookie_after_update` AFTER UPDATE ON `pookie`
FOR EACH ROW
BEGIN
  INSERT INTO `pookie_log` (`id`,`date`,`hole`,`isBusy`,`location`,`noOfPeople`,`rooms`,`time`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`, `rowVersion`)
  VALUES (NEW.`id`,NEW.`date`,NEW.`hole`,NEW.`isBusy`,NEW.`location`,NEW.`noOfPeople`,NEW.`rooms`,NEW.`time`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE', NEW.`rowVersion`);
END$$

DROP TRIGGER IF EXISTS `pookie_after_delete`$$
CREATE TRIGGER `pookie_after_delete` AFTER DELETE ON `pookie`
FOR EACH ROW
BEGIN
  INSERT INTO `pookie_log` (`id`,`date`,`hole`,`isBusy`,`location`,`noOfPeople`,`rooms`,`time`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`, `rowVersion`)
  VALUES (OLD.`id`,OLD.`date`,OLD.`hole`,OLD.`isBusy`,OLD.`location`,OLD.`noOfPeople`,OLD.`rooms`,OLD.`time`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE', OLD.`rowVersion`);
END$$

DELIMITER ;
