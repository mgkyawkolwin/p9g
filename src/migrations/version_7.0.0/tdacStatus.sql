-- STEP (1)
INSERT INTO `config` (`id`, `group`, `value`, `text`, `createdAtUTC`, `createdBy`, `updatedAtUTC`, `updatedBy`) VALUES 
(uuid(), 'MEDIA_GROUP', 'GENERAL', 'General', NOW(), '00000000-0000-0000-0000-000000000000', NOW(), '00000000-0000-0000-0000-000000000000'),
(uuid(), 'MEDIA_GROUP', 'TDAC', 'TDAC', NOW(), '00000000-0000-0000-0000-000000000000', NOW(), '00000000-0000-0000-0000-000000000000');

INSERT INTO `config` (`id`, `group`, `value`, `text`, `createdAtUTC`, `createdBy`, `updatedAtUTC`, `updatedBy`) VALUES 
(uuid(), 'TDAC_STATUS', 'NOT_REQUIRED', 'Not Required', NOW(), '00000000-0000-0000-0000-000000000000', NOW(), '00000000-0000-0000-0000-000000000000'),
(uuid(), 'TDAC_STATUS', 'REQUIRED', 'Required', NOW(), '00000000-0000-0000-0000-000000000000', NOW(), '00000000-0000-0000-0000-000000000000'),
(uuid(), 'TDAC_STATUS', 'SENT', 'Sent', NOW(), '00000000-0000-0000-0000-000000000000', NOW(), '00000000-0000-0000-0000-000000000000');
-- 
ALTER TABLE `media` ADD `mediaGroupId` char(36) NOT NULL;
SET @mediaGroupGeneralId = (SELECT `id` FROM `config` WHERE `group`='MEDIA_GROUP' AND `value`='GENERAL' LIMIT 1);
UPDATE `media` SET `mediaGroupId`= @mediaGroupGeneralId;
ALTER TABLE `media` ADD CONSTRAINT `media_mediaGroupId_config_id_fk` FOREIGN KEY (`mediaGroupId`) REFERENCES `config`(`id`) ON DELETE restrict ON UPDATE no action;
-- 
SELECT @tdacStatusNotRequiredId := `id` FROM `config` WHERE `group` = 'TDAC_STATUS' AND `value` = 'NOT_REQUIRED';
ALTER TABLE `reservationCustomer` ADD `tdacStatusId` char(36) NOT NULL;
UPDATE `reservationCustomer` SET `tdacStatusId` = @tdacStatusNotRequiredId;
ALTER TABLE `reservationCustomer` ADD CONSTRAINT `reservationCustomer_tdacStatusId_config_id_fk` FOREIGN KEY (`tdacStatusId`) REFERENCES `config`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;
--
INSERT INTO `media` (`id`, `reservationId`, `customerId`, `mediaGroupId`, `url`, `createdAtUTC`, `createdBy`, `updatedAtUTC`, `updatedBy`)
SELECT uuid(), `reservationId`, `customerId`, (SELECT `id` FROM `config` WHERE `group` = 'MEDIA_GROUP' AND `value` = 'TDAC'), `tdacFileUrl`, NOW(), '00000000-0000-0000-0000-000000000000', NOW(), '00000000-0000-0000-0000-000000000000'
FROM `reservationCustomer`
WHERE `tdacFileUrl` IS NOT NULL AND `tdacFileUrl` != '';
--
ALTER TABLE `reservationCustomer` DROP COLUMN `tdacFileUrl`;


