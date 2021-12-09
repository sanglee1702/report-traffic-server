import UserControllers from '../controllers/user.controller';
import express from 'express';
import DeliveryControllers from '../controllers/delivery.controllers';

const UserRouter = express.Router();

const USER_PATH = '/users';

// get deliveries
UserRouter.get(
  `${USER_PATH}/delivery-address`,
  UserControllers.getDeliveryAddresses,
);
// create
UserRouter.post(
  `${USER_PATH}/delivery-address`,
  UserControllers.createDeliveryAddresses,
);
// delete address
UserRouter.delete(
  `${USER_PATH}/delivery-address/:deliveryAddressId`,
  UserControllers.deleteDeliveryAddress,
);
//update
UserRouter.put(
  `${USER_PATH}/delivery-address`,
  UserControllers.updateDeliveryAddress,
);
// add more info user
UserRouter.put(`${USER_PATH}/update-infos`, UserControllers.updateUserInfos);
// update avatar
UserRouter.put(`${USER_PATH}/avatar`, UserControllers.uploadAvatar);

// get user info
UserRouter.get(`${USER_PATH}/infos`, UserControllers.getUserInfo);
// get admin user info
// get current point user
UserRouter.get(`${USER_PATH}/points`, UserControllers.getUserPoints);
UserRouter.get(`${USER_PATH}/wishlist`, UserControllers.getWishlist);
UserRouter.get(
  `${USER_PATH}/wishlist/articles`,
  UserControllers.getArticleWishlist,
);
UserRouter.put(`${USER_PATH}/password`, UserControllers.updatePassowrd);
UserRouter.get(`${USER_PATH}/discounts`, UserControllers.getDiscountCodes);

// user get list deliveries
UserRouter.get(
  `${USER_PATH}/deliveries`,
  DeliveryControllers.getDeliveriesByUser,
);
// user get delivery detail
UserRouter.get(
  `${USER_PATH}/deliveries/:id`,
  DeliveryControllers.getDeliveryByUser,
);

export default UserRouter;
