CREATE TABLE `tophub` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `item_id` varchar(255) NULL DEFAULT NULL,
  `title` varchar(255) NULL DEFAULT NULL,
  `cover` varchar(255) NULL DEFAULT NULL,
  `timestamp` bigint NULL DEFAULT NULL,
  `hot` varchar(50) NULL DEFAULT NULL,
  `url` varchar(255) NULL DEFAULT NULL,
  `mobileUrl` varchar(255) NULL DEFAULT NULL,
  `hasTT` int NULL DEFAULT NULL,
  `hasWT` int NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `classify` varchar(255) NULL DEFAULT NULL,
  UNIQUE (`item_id`)
);