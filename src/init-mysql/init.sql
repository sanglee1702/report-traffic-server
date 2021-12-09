

CREATE EVENT IF NOT EXISTS event_trigger_has_done_the_challenge
ON SCHEDULE
    EVERY 1 DAY
    STARTS (TIMESTAMP(CURRENT_DATE) + INTERVAL 1 DAY + INTERVAL 1 HOUR)
DO
  SELECT `id`, `challengesId`, `userId`, `startDate`, `endDate`, `totalRun`, `groupId`, `paidType`, `currentGiftReceiving`, `status`, `giftBoxesOpened`, `orderId`, `isPaid`, `isCurrentChallenge`, `objectStatus`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt` FROM `UserChallenges` AS `UserChallenges` WHERE `UserChallenges`.`status` = 'CreateNew' AND `UserChallenges`.`endDate` < NOW()
  