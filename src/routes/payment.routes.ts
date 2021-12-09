import PaymentControllers from '../controllers/payment.controllers';
import express from 'express';

const PaymentRouter = express.Router();

const PAYMENT_PATH = '/payments';

//#region challenges
// user register challenge
PaymentRouter.post(
  `${PAYMENT_PATH}/challenge/create`,
  PaymentControllers.createPaymentChallenge,
);
PaymentRouter.put(
  `${PAYMENT_PATH}/challenge/confirm`,
  PaymentControllers.confirmPaymentChallenge,
);
PaymentRouter.get(
  `${PAYMENT_PATH}/histories`,
  PaymentControllers.getPaymentHistories,
);
PaymentRouter.get(
  `${PAYMENT_PATH}/histories/:id`,
  PaymentControllers.getDetailPaymentHistory,
);
//#endregion challenges

//#region  products
PaymentRouter.post(
  `${PAYMENT_PATH}/products`,
  PaymentControllers.createPaymentProduct,
);
PaymentRouter.put(
  `${PAYMENT_PATH}/products/confirm`,
  PaymentControllers.confirmPaymentProduct,
);
//#endregion products

PaymentRouter.put(
  `${PAYMENT_PATH}/alepay/confirm`,
  PaymentControllers.savePaymentForAlepay,
);

PaymentRouter.get(`${PAYMENT_PATH}/reports`, PaymentControllers.reportPayments);
//
PaymentRouter.get(
  `${PAYMENT_PATH}/get-card-links`,
  PaymentControllers.getCardLinks,
);
PaymentRouter.delete(
  `${PAYMENT_PATH}/delete-card-links/:token`,
  PaymentControllers.deleteCardLinks,
);

export default PaymentRouter;
