import CommonControllers from '../controllers/common.controllers';
import express from 'express';

const CommonRouter = express.Router();

const AUTH_PATH = '/common';

// login
CommonRouter.get(`${AUTH_PATH}/order`, CommonControllers.getOrderId);
CommonRouter.get(
  `${AUTH_PATH}/check-referral-code/:referralCode`,
  CommonControllers.getCheckReferralCode,
);

CommonRouter.post(
  `${AUTH_PATH}/push-notifications`,
  CommonControllers.pushNotification,
);
CommonRouter.get(`${AUTH_PATH}/config`, CommonControllers.getConfigAPP);

export default CommonRouter;
