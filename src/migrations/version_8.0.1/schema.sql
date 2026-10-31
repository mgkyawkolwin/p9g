ALTER TABLE `prepaid` MODIFY COLUMN `days` int NOT NULL;
ALTER TABLE `bookingInvoiceItem` ADD `rateUSD` decimal DEFAULT '0' NOT NULL;
ALTER TABLE `bookingInvoiceItem` ADD `amountUSD` decimal DEFAULT '0' NOT NULL;
ALTER TABLE `invoice` ADD `depositUSD` decimal DEFAULT '0' NOT NULL;
ALTER TABLE `invoice` ADD `totalAmountUSD` decimal DEFAULT '0' NOT NULL;
ALTER TABLE `invoice` ADD `dueAmountUSD` decimal DEFAULT '0' NOT NULL;
ALTER TABLE `reservationCustomer` ADD `baggageTransfer` varchar(10);
ALTER TABLE `reservationCustomer` ADD `visaRequired` boolean DEFAULT false NOT NULL;
ALTER TABLE `simpleInvoiceItem` ADD `amountUSD` decimal DEFAULT '0' NOT NULL;

-- Same column changes for the log tables
ALTER TABLE `prepaid_log` MODIFY COLUMN `days` int NOT NULL;
ALTER TABLE `bookingInvoiceItem_log` ADD `rateUSD` decimal DEFAULT '0' NOT NULL;
ALTER TABLE `bookingInvoiceItem_log` ADD `amountUSD` decimal DEFAULT '0' NOT NULL;
ALTER TABLE `invoice_log` ADD `depositUSD` decimal DEFAULT '0' NOT NULL;
ALTER TABLE `invoice_log` ADD `totalAmountUSD` decimal DEFAULT '0' NOT NULL;
ALTER TABLE `invoice_log` ADD `dueAmountUSD` decimal DEFAULT '0' NOT NULL;
ALTER TABLE `reservationCustomer_log` ADD `baggageTransfer` varchar(10);
ALTER TABLE `reservationCustomer_log` ADD `visaRequired` boolean DEFAULT false NOT NULL;
ALTER TABLE `simpleInvoiceItem_log` ADD `amountUSD` decimal DEFAULT '0' NOT NULL;

DELIMITER $$

-- Triggers for prepaid
DROP TRIGGER IF EXISTS `prepaid_after_insert`$$
CREATE TRIGGER `prepaid_after_insert` AFTER INSERT ON `prepaid`
FOR EACH ROW
BEGIN
  INSERT INTO `prepaid_log` (`id`,`value`,`text`,`days`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`value`,NEW.`text`,NEW.`days`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `prepaid_after_update`$$
CREATE TRIGGER `prepaid_after_update` AFTER UPDATE ON `prepaid`
FOR EACH ROW
BEGIN
  INSERT INTO `prepaid_log` (`id`,`value`,`text`,`days`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`value`,NEW.`text`,NEW.`days`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `prepaid_after_delete`$$
CREATE TRIGGER `prepaid_after_delete` AFTER DELETE ON `prepaid`
FOR EACH ROW
BEGIN
  INSERT INTO `prepaid_log` (`id`,`value`,`text`,`days`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`value`,OLD.`text`,OLD.`days`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for invoice
DROP TRIGGER IF EXISTS `invoice_after_insert`$$
CREATE TRIGGER `invoice_after_insert` AFTER INSERT ON `invoice`
FOR EACH ROW
BEGIN
  INSERT INTO `invoice_log` (`id`,`invoiceNumber`,`invoiceDate`,`agentName`,`customerName`,`pax`,`depositKWR`,`depositTHB`,`depositUSD`,`totalAmountKWR`,`totalAmountTHB`,`totalAmountUSD`,`dueAmountKWR`,`dueAmountTHB`,`dueAmountUSD`,`status`,`included`,`notIncluded`,`note`,`bookingSource`,`bookingPerson`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`invoiceNumber`,NEW.`invoiceDate`,NEW.`agentName`,NEW.`customerName`,NEW.`pax`,NEW.`depositKWR`,NEW.`depositTHB`,NEW.`depositUSD`,NEW.`totalAmountKWR`,NEW.`totalAmountTHB`,NEW.`totalAmountUSD`,NEW.`dueAmountKWR`,NEW.`dueAmountTHB`,NEW.`dueAmountUSD`,NEW.`status`,NEW.`included`,NEW.`notIncluded`,NEW.`note`,NEW.`bookingSource`,NEW.`bookingPerson`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `invoice_after_update`$$
CREATE TRIGGER `invoice_after_update` AFTER UPDATE ON `invoice`
FOR EACH ROW
BEGIN
  INSERT INTO `invoice_log` (`id`,`invoiceNumber`,`invoiceDate`,`agentName`,`customerName`,`pax`,`depositKWR`,`depositTHB`,`depositUSD`,`totalAmountKWR`,`totalAmountTHB`,`totalAmountUSD`,`dueAmountKWR`,`dueAmountTHB`,`dueAmountUSD`,`status`,`included`,`notIncluded`,`note`,`bookingSource`,`bookingPerson`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`invoiceNumber`,NEW.`invoiceDate`,NEW.`agentName`,NEW.`customerName`,NEW.`pax`,NEW.`depositKWR`,NEW.`depositTHB`,NEW.`depositUSD`,NEW.`totalAmountKWR`,NEW.`totalAmountTHB`,NEW.`totalAmountUSD`,NEW.`dueAmountKWR`,NEW.`dueAmountTHB`,NEW.`dueAmountUSD`,NEW.`status`,NEW.`included`,NEW.`notIncluded`,NEW.`note`,NEW.`bookingSource`,NEW.`bookingPerson`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `invoice_after_delete`$$
CREATE TRIGGER `invoice_after_delete` AFTER DELETE ON `invoice`
FOR EACH ROW
BEGIN
  INSERT INTO `invoice_log` (`id`,`invoiceNumber`,`invoiceDate`,`agentName`,`customerName`,`pax`,`depositKWR`,`depositTHB`,`depositUSD`,`totalAmountKWR`,`totalAmountTHB`,`totalAmountUSD`,`dueAmountKWR`,`dueAmountTHB`,`dueAmountUSD`,`status`,`included`,`notIncluded`,`note`,`bookingSource`,`bookingPerson`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`invoiceNumber`,OLD.`invoiceDate`,OLD.`agentName`,OLD.`customerName`,OLD.`pax`,OLD.`depositKWR`,OLD.`depositTHB`,OLD.`depositUSD`,OLD.`totalAmountKWR`,OLD.`totalAmountTHB`,OLD.`totalAmountUSD`,OLD.`dueAmountKWR`,OLD.`dueAmountTHB`,OLD.`dueAmountUSD`,OLD.`status`,OLD.`included`,OLD.`notIncluded`,OLD.`note`,OLD.`bookingSource`,OLD.`bookingPerson`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for simpleInvoiceItem
DROP TRIGGER IF EXISTS `simpleInvoiceItem_after_insert`$$
CREATE TRIGGER `simpleInvoiceItem_after_insert` AFTER INSERT ON `simpleInvoiceItem`
FOR EACH ROW
BEGIN
  INSERT INTO `simpleInvoiceItem_log` (`id`,`invoiceId`,`description`,`amountKWR`,`amountTHB`,`amountUSD`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`invoiceId`,NEW.`description`,NEW.`amountKWR`,NEW.`amountTHB`,NEW.`amountUSD`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `simpleInvoiceItem_after_update`$$
CREATE TRIGGER `simpleInvoiceItem_after_update` AFTER UPDATE ON `simpleInvoiceItem`
FOR EACH ROW
BEGIN
  INSERT INTO `simpleInvoiceItem_log` (`id`,`invoiceId`,`description`,`amountKWR`,`amountTHB`,`amountUSD`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`invoiceId`,NEW.`description`,NEW.`amountKWR`,NEW.`amountTHB`,NEW.`amountUSD`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `simpleInvoiceItem_after_delete`$$
CREATE TRIGGER `simpleInvoiceItem_after_delete` AFTER DELETE ON `simpleInvoiceItem`
FOR EACH ROW
BEGIN
  INSERT INTO `simpleInvoiceItem_log` (`id`,`invoiceId`,`description`,`amountKWR`,`amountTHB`,`amountUSD`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`invoiceId`,OLD.`description`,OLD.`amountKWR`,OLD.`amountTHB`,OLD.`amountUSD`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for bookingInvoiceItem
DROP TRIGGER IF EXISTS `bookingInvoiceItem_after_insert`$$
CREATE TRIGGER `bookingInvoiceItem_after_insert` AFTER INSERT ON `bookingInvoiceItem`
FOR EACH ROW
BEGIN
  INSERT INTO `bookingInvoiceItem_log` (`id`,`invoiceId`,`description`,`location`,`startDate`,`endDate`,`pax`,`rateKWR`,`rateTHB`,`rateUSD`,`amountKWR`,`amountTHB`,`amountUSD`,`noOfRooms`,`noOfDays`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`invoiceId`,NEW.`description`,NEW.`location`,NEW.`startDate`,NEW.`endDate`,NEW.`pax`,NEW.`rateKWR`,NEW.`rateTHB`,NEW.`rateUSD`,NEW.`amountKWR`,NEW.`amountTHB`,NEW.`amountUSD`,NEW.`noOfRooms`,NEW.`noOfDays`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `bookingInvoiceItem_after_update`$$
CREATE TRIGGER `bookingInvoiceItem_after_update` AFTER UPDATE ON `bookingInvoiceItem`
FOR EACH ROW
BEGIN
  INSERT INTO `bookingInvoiceItem_log` (`id`,`invoiceId`,`description`,`location`,`startDate`,`endDate`,`pax`,`rateKWR`,`rateTHB`,`rateUSD`,`amountKWR`,`amountTHB`,`amountUSD`,`noOfRooms`,`noOfDays`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`invoiceId`,NEW.`description`,NEW.`location`,NEW.`startDate`,NEW.`endDate`,NEW.`pax`,NEW.`rateKWR`,NEW.`rateTHB`,NEW.`rateUSD`,NEW.`amountKWR`,NEW.`amountTHB`,NEW.`amountUSD`,NEW.`noOfRooms`,NEW.`noOfDays`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `bookingInvoiceItem_after_delete`$$
CREATE TRIGGER `bookingInvoiceItem_after_delete` AFTER DELETE ON `bookingInvoiceItem`
FOR EACH ROW
BEGIN
  INSERT INTO `bookingInvoiceItem_log` (`id`,`invoiceId`,`description`,`location`,`startDate`,`endDate`,`pax`,`rateKWR`,`rateTHB`,`rateUSD`,`amountKWR`,`amountTHB`,`amountUSD`,`noOfRooms`,`noOfDays`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`invoiceId`,OLD.`description`,OLD.`location`,OLD.`startDate`,OLD.`endDate`,OLD.`pax`,OLD.`rateKWR`,OLD.`rateTHB`,OLD.`rateUSD`,OLD.`amountKWR`,OLD.`amountTHB`,OLD.`amountUSD`,OLD.`noOfRooms`,OLD.`noOfDays`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

-- Triggers for reservationCustomer
DROP TRIGGER IF EXISTS `reservationCustomer_after_insert`$$
CREATE TRIGGER `reservationCustomer_after_insert` AFTER INSERT ON `reservationCustomer`
FOR EACH ROW
BEGIN
  INSERT INTO `reservationCustomer_log` (`id`,`reservationId`,`customerId`,`tdacStatusId`,`baggageTransfer`,`visaRequired`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`customerId`,NEW.`tdacStatusId`,NEW.`baggageTransfer`,NEW.`visaRequired`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'INSERT');
END$$

DROP TRIGGER IF EXISTS `reservationCustomer_after_update`$$
CREATE TRIGGER `reservationCustomer_after_update` AFTER UPDATE ON `reservationCustomer`
FOR EACH ROW
BEGIN
  INSERT INTO `reservationCustomer_log` (`id`,`reservationId`,`customerId`,`tdacStatusId`,`baggageTransfer`,`visaRequired`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (NEW.`id`,NEW.`reservationId`,NEW.`customerId`,NEW.`tdacStatusId`,NEW.`baggageTransfer`,NEW.`visaRequired`,NEW.`createdAtUTC`,NEW.`createdBy`,NEW.`updatedAtUTC`,NEW.`updatedBy`,'UPDATE');
END$$

DROP TRIGGER IF EXISTS `reservationCustomer_after_delete`$$
CREATE TRIGGER `reservationCustomer_after_delete` AFTER DELETE ON `reservationCustomer`
FOR EACH ROW
BEGIN
  INSERT INTO `reservationCustomer_log` (`id`,`reservationId`,`customerId`,`tdacStatusId`,`baggageTransfer`,`visaRequired`,`createdAtUTC`,`createdBy`,`updatedAtUTC`,`updatedBy`,`trigger`)
  VALUES (OLD.`id`,OLD.`reservationId`,OLD.`customerId`,OLD.`tdacStatusId`,OLD.`baggageTransfer`,OLD.`visaRequired`,OLD.`createdAtUTC`,OLD.`createdBy`,OLD.`updatedAtUTC`,OLD.`updatedBy`,'DELETE');
END$$

DELIMITER ;