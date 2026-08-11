--
INSERT INTO `config` (`id`, `group`, `value`, `text`, `createdAtUTC`, `createdBy`, `updatedAtUTC`, `updatedBy`) VALUES 
(uuid(), 'INVOICE_STATUS', 'NOT_REQUIRED', 'Not Required', NOW(), '00000000-0000-0000-0000-000000000000', NOW(), '00000000-0000-0000-0000-000000000000'),
(uuid(), 'INVOICE_STATUS', 'REQUIRED', 'Required', NOW(), '00000000-0000-0000-0000-000000000000', NOW(), '00000000-0000-0000-0000-000000000000'),
(uuid(), 'INVOICE_STATUS', 'SENT', 'Sent', NOW(), '00000000-0000-0000-0000-000000000000', NOW(), '00000000-0000-0000-0000-000000000000');
--
ALTER TABLE `reservation` ADD `invoiceStatusId` char(36) NOT NULL;
ALTER TABLE `reservation` ADD `invoiceNumber` varchar(10);
--
SET @invoiceStatusNotRequiredId = (SELECT `id` FROM `config` WHERE `group`='INVOICE_STATUS' AND `value`='NOT_REQUIRED' LIMIT 1);
UPDATE `reservation` SET `invoiceStatusId`= @invoiceStatusNotRequiredId;
--
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_invoiceStatusId_config_id_fk` FOREIGN KEY (`invoiceStatusId`) REFERENCES `config`(`id`) ON DELETE no action ON UPDATE no action;