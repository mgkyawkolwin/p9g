ALTER TABLE `pookie` ADD `rowVersion` char(36) NOT NULL;
UPDATE pookie SET rowVersion = UUID();