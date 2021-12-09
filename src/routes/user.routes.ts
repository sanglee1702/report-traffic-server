import UserControllers from "../controllers/user.controller";
import express from "express";

const UserRouter = express.Router();

const USER_PATH = "/users";

// add more info user
UserRouter.put(`${USER_PATH}/update-infos`, UserControllers.updateUserInfos);
// update avatar
UserRouter.put(`${USER_PATH}/avatar`, UserControllers.uploadAvatar);

// get user info
UserRouter.get(`${USER_PATH}/infos`, UserControllers.getUserInfo);
// get admin user info
// get current point user
UserRouter.get(`${USER_PATH}/points`, UserControllers.getUserPoints);

export default UserRouter;
