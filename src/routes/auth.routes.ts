import AuthControllers from '../controllers/auth.controllers';
import express from 'express';

const AuthRouter = express.Router();

const AUTH_PATH = '/auth';

// login
AuthRouter.post(`${AUTH_PATH}/login`, AuthControllers.login);
// confirm login
AuthRouter.post(`${AUTH_PATH}/confirm-login`, AuthControllers.confirmLogin);
AuthRouter.post(`${AUTH_PATH}/logout/:username`, AuthControllers.logout);
// login admin
AuthRouter.post(`${AUTH_PATH}/admin/login`, AuthControllers.loginAdmin);
// create admin
AuthRouter.post(`${AUTH_PATH}/admin`, AuthControllers.createAdminUser);
AuthRouter.put(
  `${AUTH_PATH}/admin/:accountId`,
  AuthControllers.updateAdminUser,
);
AuthRouter.get(`${AUTH_PATH}/admin/users`, AuthControllers.getUsers);
AuthRouter.put(
  `${AUTH_PATH}/admin/update/password`,
  AuthControllers.updatePassowrd,
);
// delete product category
AuthRouter.delete(
  `${AUTH_PATH}/users/:userId`,
  AuthControllers.deleteUserAsync,
);
//
AuthRouter.get(`${AUTH_PATH}/reports`, AuthControllers.reportAccount);
AuthRouter.put(`${AUTH_PATH}/update-fcm-token`, AuthControllers.updateFCMToken);

export default AuthRouter;
