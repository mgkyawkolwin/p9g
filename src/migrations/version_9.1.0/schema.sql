ALTER TABLE `media` MODIFY `reservationId` char(36) NULL;
ALTER TABLE `media_log` MODIFY `reservationId` char(36) NULL;

ALTER TABLE `feedback` ADD `isTaskCreated` tinyint(1) NOT NULL DEFAULT 0;
ALTER TABLE `feedback_log` ADD `isTaskCreated` tinyint(1) NOT NULL DEFAULT 0;


DELIMITER ;

CREATE TABLE IF NOT EXISTS `task` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `reservationId` CHAR(36) NULL,
  `customerId` CHAR(36) NULL,
  `description` TEXT NOT NULL,
  `department` VARCHAR(50) NULL,
  `status` VARCHAR(50) NOT NULL,
  `remark` varchar(255) NULL,
  `targetCompletionDateTime` DATETIME(3) NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  CONSTRAINT `task_reservationId_reservation_id_fk` FOREIGN KEY (`reservationId`) REFERENCES `reservation`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `task_customerId_customer_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `task_log` (
  `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id` CHAR(36) NOT NULL,
  `reservationId` CHAR(36) NULL,
  `customerId` CHAR(36) NULL,
  `description` TEXT NOT NULL,
  `department` VARCHAR(50) NULL,
  `status` VARCHAR(50) NOT NULL,
  `remark` varchar(255) NULL,
  `targetCompletionDateTime` DATETIME(3) NULL,
  `createdAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `createdBy` CHAR(36) NOT NULL,
  `updatedAtUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `updatedBy` CHAR(36) NOT NULL,
  `trigger` ENUM('INSERT','UPDATE','DELETE') NOT NULL,
  `triggerDateTimeUTC` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DELIMITER $$

DROP TRIGGER IF EXISTS `feedback_after_insert`$$
CREATE TRIGGER `feedback_after_insert` AFTER INSERT ON `feedback`
FOR EACH ROW
BEGIN
  INSERT INTO `feedback_log` (`id`,`reservationId`,`customerId`,`feedback`,`isTaskCreated`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`customerId`,NEW.`feedback`,NEW.`isTaskCreated`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `feedback_after_update`$$
CREATE TRIGGER `feedback_after_update` AFTER UPDATE ON `feedback`
FOR EACH ROW
BEGIN
  INSERT INTO `feedback_log` (`id`,`reservationId`,`customerId`,`feedback`,`isTaskCreated`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`customerId`,NEW.`feedback`,NEW.`isTaskCreated`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `feedback_after_delete`$$
CREATE TRIGGER `feedback_after_delete` AFTER DELETE ON `feedback`
FOR EACH ROW
BEGIN
  INSERT INTO `feedback_log` (`id`,`reservationId`,`customerId`,`feedback`,`isTaskCreated`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`reservationId`,OLD.`customerId`,OLD.`feedback`,OLD.`isTaskCreated`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

DROP TRIGGER IF EXISTS `task_after_insert`$$
CREATE TRIGGER `task_after_insert` AFTER INSERT ON `task`
FOR EACH ROW
BEGIN
  INSERT INTO `task_log` (`id`,`reservationId`,`customerId`,`description`,`department`,`status`,`remark`,`targetCompletionDateTime`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`customerId`,NEW.`description`,NEW.`department`,NEW.`status`,NEW.`remark`,NEW.`targetCompletionDateTime`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `task_after_update`$$
CREATE TRIGGER `task_after_update` AFTER UPDATE ON `task`
FOR EACH ROW
BEGIN
  INSERT INTO `task_log` (`id`,`reservationId`,`customerId`,`description`,`department`,`status`,`remark`,`targetCompletionDateTime`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`customerId`,NEW.`description`,NEW.`department`,NEW.`status`,NEW.`remark`,NEW.`targetCompletionDateTime`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `task_after_delete`$$
CREATE TRIGGER `task_after_delete` AFTER DELETE ON `task`
FOR EACH ROW
BEGIN
  INSERT INTO `task_log` (`id`,`reservationId`,`customerId`,`description`,`department`,`status`,`remark`,`targetCompletionDateTime`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`reservationId`,OLD.`customerId`,OLD.`description`,OLD.`department`,OLD.`status`,OLD.`remark`,OLD.`targetCompletionDateTime`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

DELIMITER ;