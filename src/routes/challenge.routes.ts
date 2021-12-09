import ChallengeControllers from '../controllers/challenge.controllers';
import express from 'express';

const ChallengeRouter = express.Router();

const CHALLENGE_PATH = '/challenges';

// get the current challenges
ChallengeRouter.get(`${CHALLENGE_PATH}`, ChallengeControllers.getAllChallenges);
// get challenges from id
ChallengeRouter.get(
  `${CHALLENGE_PATH}/:challengeId`,
  ChallengeControllers.getChallenge,
);

// get current challenge for user
ChallengeRouter.get(
  `${CHALLENGE_PATH}/histories/current`,
  ChallengeControllers.getCurrentHistoryRun,
);
// update step count for user today
ChallengeRouter.put(
  `${CHALLENGE_PATH}/histories/update`,
  ChallengeControllers.updateTodayStepCount,
);

// create challenge
ChallengeRouter.post(`${CHALLENGE_PATH}/create`, ChallengeControllers.create);
//update challenge
ChallengeRouter.put(
  `${CHALLENGE_PATH}/update/:id`,
  ChallengeControllers.update,
);
// delete
ChallengeRouter.delete(
  `${CHALLENGE_PATH}/delete/:id`,
  ChallengeControllers.deleteAsync,
);

// mark As Done
ChallengeRouter.post(
  `${CHALLENGE_PATH}/mark-as-done/:userChallengeId`,
  ChallengeControllers.markAsDone,
);

export default ChallengeRouter;
