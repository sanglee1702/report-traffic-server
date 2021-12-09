import express from 'express';
import NotificationsControllers from '../controllers/notifications.controllers';

const NotificationsRouter = express.Router();

const NOTIFICATIONS_PATH = '/notifications';

// gets
NotificationsRouter.get(`${NOTIFICATIONS_PATH}`, NotificationsControllers.gets);
// get list by user
NotificationsRouter.get(
  `${NOTIFICATIONS_PATH}/users`,
  NotificationsControllers.getsByUser,
);
// create
NotificationsRouter.post(
  `${NOTIFICATIONS_PATH}`,
  NotificationsControllers.create,
);
// update
NotificationsRouter.put(
  `${NOTIFICATIONS_PATH}/:id`,
  NotificationsControllers.update,
);
// delete
NotificationsRouter.delete(
  `${NOTIFICATIONS_PATH}/:id`,
  NotificationsControllers.deleteAsync,
);
//push notifications
NotificationsRouter.post(
  `${NOTIFICATIONS_PATH}/send/:id`,
  NotificationsControllers.pushNotification,
);

//mark as read
NotificationsRouter.post(
  `${NOTIFICATIONS_PATH}/mark-as-read/:id`,
  NotificationsControllers.markAsReadAsync,
);
//mark as read all
NotificationsRouter.post(
  `${NOTIFICATIONS_PATH}/mark-as-reads`,
  NotificationsControllers.markAsReadAllAsync,
);
//user delete
NotificationsRouter.delete(
  `${NOTIFICATIONS_PATH}/users/:id`,
  NotificationsControllers.deleteByUserAsync,
);
export default NotificationsRouter;
