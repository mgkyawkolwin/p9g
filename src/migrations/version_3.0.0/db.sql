ALTER TABLE `customer` ADD `gender` varchar(10);

UPDATE `customer` SET `gender` = 'Unknown';

ALTER TABLE `customer` MODIFY COLUMN `gender` varchar(10) NOT NULL;