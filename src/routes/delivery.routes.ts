import DeliveryControllers from '../controllers/delivery.controllers';
import express from 'express';

const DeliveryRouter = express.Router();

const DELIVERY_PATH = '/deliveries';

DeliveryRouter.get(`${DELIVERY_PATH}`, DeliveryControllers.getDeliveries);
DeliveryRouter.get(`${DELIVERY_PATH}/:id`, DeliveryControllers.getDelivery);

DeliveryRouter.put(
  `${DELIVERY_PATH}/status/:id`,
  DeliveryControllers.updateShippingStatus,
);
DeliveryRouter.put(`${DELIVERY_PATH}/:id`, DeliveryControllers.updateDelivery);

export default DeliveryRouter;
