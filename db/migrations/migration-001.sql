-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: qa-report-db.cguo6a5z5klt.us-west-2.rds.amazonaws.com:3306
-- Generation Time: Nov 23, 2022 at 10:04 AM
-- Server version: 5.7.40
-- PHP Version: 8.0.25
--
-- Database: `qa_reports`
--

-- --------------------------------------------------------

--
-- Table structure for table `environments`
--

CREATE TABLE `environments` (
  `id` varchar(32) COLLATE utf16_unicode_ci NOT NULL,
  `description` text COLLATE utf16_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_unicode_ci; 

--
-- Table structure for table `epics`
--

CREATE TABLE `epics` (
  `id` varchar(32) COLLATE utf16_unicode_ci NOT NULL,
  `supersede` varchar(32) COLLATE utf16_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf16_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_unicode_ci;

--
-- Table structure for table `executions`
--

CREATE TABLE `executions` (
  `id` varchar(56) COLLATE utf16_unicode_ci NOT NULL,
  `env_id` varchar(32) COLLATE utf16_unicode_ci NOT NULL,
  `timestamp` char(24) COLLATE utf16_unicode_ci NOT NULL,
  `description` text COLLATE utf16_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_unicode_ci;

--
-- Triggers `executions`
--
DELIMITER $$
CREATE TRIGGER `build pKey` BEFORE INSERT ON `executions` FOR EACH ROW SET NEW.id = CONCAT(NEW.env_id, '_', NEW.timestamp)
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `executions_results`
--

CREATE TABLE `executions_results` (
  `execution_id` varchar(56) COLLATE utf16_unicode_ci NOT NULL,
  `test_id` varchar(32) COLLATE utf16_unicode_ci NOT NULL,
  `result` tinyint(1) DEFAULT NULL,
  `step` text COLLATE utf16_unicode_ci,
  `stacktrace` text COLLATE utf16_unicode_ci,
  `screenshot` blob
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_unicode_ci;

--
-- Table structure for table `stories`
--

CREATE TABLE `stories` (
  `id` varchar(32) COLLATE utf16_unicode_ci NOT NULL,
  `epic_id` varchar(32) COLLATE utf16_unicode_ci NOT NULL,
  `supersede` varchar(32) COLLATE utf16_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf16_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tests`
--

CREATE TABLE `tests` (
  `id` varchar(32) COLLATE utf16_unicode_ci NOT NULL,
  `story_id` varchar(32) COLLATE utf16_unicode_ci NOT NULL,
  `supersede` varchar(32) COLLATE utf16_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf16_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf16 COLLATE=utf16_unicode_ci;


--
-- Stand-in structure for view `tests_results`
-- (See below for the actual view)
--
CREATE TABLE `tests_results` (
`Epic` varchar(32)
,`Story` varchar(32)
,`Test` varchar(32)
,`Execution` varchar(56)
,`Result` tinyint(1)
);

-- --------------------------------------------------------

--
-- Structure for view `tests_results`
--
DROP TABLE IF EXISTS `tests_results`;

CREATE ALGORITHM=UNDEFINED DEFINER=`admin`@`%` SQL SECURITY DEFINER VIEW `tests_results`  AS SELECT `epics`.`id` AS `Epic`, `stories`.`id` AS `Story`, `tests`.`id` AS `Test`, `executions`.`id` AS `Execution`, `executions_results`.`result` AS `Result` FROM ((((`executions_results` join `executions` on((`executions`.`id` = `executions_results`.`execution_id`))) join `tests` on((`tests`.`id` = `executions_results`.`test_id`))) join `stories` on((`stories`.`id` = `tests`.`story_id`))) join `epics` on((`epics`.`id` = `stories`.`epic_id`)))  ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `environments`
--
ALTER TABLE `environments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `epics`
--
ALTER TABLE `epics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supersede_epic` (`supersede`);

--
-- Indexes for table `executions`
--
ALTER TABLE `executions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `env_id` (`env_id`);

--
-- Indexes for table `executions_results`
--
ALTER TABLE `executions_results`
  ADD PRIMARY KEY (`execution_id`,`test_id`),
  ADD KEY `test_id` (`test_id`);

--
-- Indexes for table `stories`
--
ALTER TABLE `stories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `epic_fk` (`epic_id`),
  ADD KEY `supersede_story` (`supersede`);

--
-- Indexes for table `tests`
--
ALTER TABLE `tests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `story_id` (`story_id`),
  ADD KEY `supersede_test` (`supersede`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `epics`
--
ALTER TABLE `epics`
  ADD CONSTRAINT `supersede_fk` FOREIGN KEY (`supersede`) REFERENCES `epics` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `executions`
--
ALTER TABLE `executions`
  ADD CONSTRAINT `env_id` FOREIGN KEY (`env_id`) REFERENCES `environments` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `executions_results`
--
ALTER TABLE `executions_results`
  ADD CONSTRAINT `execution_id` FOREIGN KEY (`execution_id`) REFERENCES `executions` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `test_id` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `stories`
--
ALTER TABLE `stories`
  ADD CONSTRAINT `epic_fk` FOREIGN KEY (`epic_id`) REFERENCES `epics` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `supersede_story` FOREIGN KEY (`supersede`) REFERENCES `stories` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `tests`
--
ALTER TABLE `tests`
  ADD CONSTRAINT `story_id` FOREIGN KEY (`story_id`) REFERENCES `stories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `supersede_test` FOREIGN KEY (`supersede`) REFERENCES `tests` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
