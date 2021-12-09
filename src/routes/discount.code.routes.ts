import DiscountCodeControllers from '../controllers/discount.code.controllers';
import express from 'express';

const DiscountCodeRouter = express.Router();

const DISCOUNT_CODE_PATH = '/discounts';

// gets
DiscountCodeRouter.get(`${DISCOUNT_CODE_PATH}`, DiscountCodeControllers.gets);
// check discount code has been used
DiscountCodeRouter.get(
  `${DISCOUNT_CODE_PATH}/detail/:id`,
  DiscountCodeControllers.getDetailById,
);
// create
DiscountCodeRouter.post(
  `${DISCOUNT_CODE_PATH}`,
  DiscountCodeControllers.create,
);
// update
DiscountCodeRouter.put(
  `${DISCOUNT_CODE_PATH}/:id`,
  DiscountCodeControllers.update,
);
// delete
DiscountCodeRouter.delete(
  `${DISCOUNT_CODE_PATH}/:id`,
  DiscountCodeControllers.deleteAsync,
);
// check discount code
DiscountCodeRouter.post(
  `${DISCOUNT_CODE_PATH}/:discountCode`,
  DiscountCodeControllers.hasUseThisDiscountCode,
);
// generate
DiscountCodeRouter.get(
  `${DISCOUNT_CODE_PATH}/generate`,
  DiscountCodeControllers.generateDiscountCode,
);

// check discount code has been used
DiscountCodeRouter.post(
  `${DISCOUNT_CODE_PATH}/has-been-used/:code`,
  DiscountCodeControllers.checkDiscountCodeHasUse,
);
// check discount code has been used
DiscountCodeRouter.get(
  `${DISCOUNT_CODE_PATH}/code/:code`,
  DiscountCodeControllers.getDetailCodeByUser,
);

export default DiscountCodeRouter;
