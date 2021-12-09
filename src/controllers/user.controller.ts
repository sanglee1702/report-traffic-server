import { hasEmail } from "./../helpers/index";
import { Request, Response } from "express";
import { hasPhoneNumber } from "../helpers";
import { checkAuthentication } from "../helpers/authentication.helpers";
import { ReporingError, UnauthorizedError } from "../utils/error";
import PointService from "../services/point.service";
import { IAddMoreInfosReq } from "./auth.controllers";
import UserService from "../services/user.service";
import { BasePagingReq } from "../models/common/models.type";
import uploadFileMiddleware from "../utils/upload";
import fs from "fs";
import { envConfig } from "../config/env.config";
import AccountService from "../services/account.service";
import { BCryptHasher } from "../utils/hasher";
import { ICreateUserModels } from "../models/users.models";
import logger from "../logs/logger";
import PointHistoryService from "../services/point.history.service";

export interface IDeliveryAddressReq {
  address: string;
  phoneNumber: string;
  email: string;
  fullName: string;
  isDefault: boolean;
  provinceCode: string;
  districtCode: string;
  wardsCode: string;
}

export interface IGetWishlistReq extends BasePagingReq {}

const _bCryptHasher = new BCryptHasher();

// Create and save new user
const updateUserInfos = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const data: IAddMoreInfosReq = request.body;

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage = validateAddMoreInfoData(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(", "),
    });
  }

  const user = await UserService.getByAccountId(authUser.id);

  let hasUpdate = false;

  if (!user) {
    //Create a user object
    const userData: ICreateUserModels = {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth || null,
      address: data.address || null,
      phoneNumber: data.phoneNumber || null,
      email: data.email || null,
      avatarUrl: data.avatarUrl || null,
      accountId: authUser.id,
      companyId: data.companyId || null,
      height: data.height || null,
      weight: data.weight || null,
    };

    const newUser = await UserService.create(userData);

    if (newUser) {
      hasUpdate = true;
    }
  } else {
    hasUpdate = await UserService.update(user.id, data);
  }

  if (!hasUpdate) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send({ message: "Update user info" });
};

const getUserInfo = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const account = await AccountService.getById(authUser.id);

  let user = await UserService.getByAccountId(authUser.id);

  if (!user) {
    //Create a user object
    const userData: ICreateUserModels = {
      accountId: authUser.id,
    };

    user = await UserService.create(userData);
  }

  if (!user) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send({
    ...UserService.toModel(user),
    username: account.username,
    role: account.role,
    referralCode: account.referralCode,
  });
};

const getUserPoints = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const point = await PointService.getByUserId(authUser.id);

  if (!point) {
    const newPoint = await PointService.create({
      point: 0,
      price: 0,
      userId: authUser.id,
      createdBy: authUser.id.toString(),
    });

    return result.send(PointService.toModel(newPoint));
  }

  return result.send(PointService.toModel(point));
};

const updatePassowrd = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const data: { oldPassword: string; newPassword: string } = request.body;

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  if (!data.newPassword) {
    return result.status(400).send({
      message: "New password is required",
    });
  }
  const account = await AccountService.getById(authUser.id);
  if (!account) {
    return result.status(400).send({ message: "Account not found" });
  }

  if (
    !(await _bCryptHasher.verifyPassword(data.oldPassword, account.password))
  ) {
    return result.status(400).send({ message: "Incorrect password" });
  }

  if (await _bCryptHasher.verifyPassword(data.newPassword, account.password)) {
    return result
      .status(400)
      .send({ message: "New password should not same old password" });
  }

  // hash password
  const passwordHash = await _bCryptHasher.hashPassword(data.newPassword);

  const hasUpdate = await AccountService.updatePassword(
    authUser.id,
    passwordHash,
    authUser.id
  );

  if (!hasUpdate) return result.status(500).send(new ReporingError().toModel());

  return result.send({ message: "Success" });
};

const uploadAvatar = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const path = "users/avatars";
  const directoryPath = `uploads/${path}`;

  const dp = directoryPath.split("/");
  let directoryPathCreate = "";

  for (let item of dp) {
    directoryPathCreate += `${item}/`;

    if (!fs.existsSync(directoryPathCreate)) {
      fs.mkdirSync(directoryPathCreate);
    }
  }

  await uploadFileMiddleware(path, (err) => {
    return result.status(400).send({ message: err.message });
  })(request, result);
  const files = request.files;

  if (!files || !files.length) {
    result.status(400).send({ message: "Not found file" });
  }

  const user = await UserService.getByAccountId(authUser.id);

  const file = (files as Express.Multer.File[]).map((file) => file.filename)[0];
  const avatar = `${envConfig.SERVER_BASE_URL}/files/${path}/${file}`;

  if (!user) {
    const newUser = await UserService.create({
      avatarUrl: avatar,
      accountId: authUser.id,
    });

    if (!newUser) return result.status(500).send(new ReporingError().toModel());
  } else {
    const hasUpdate = await UserService.update(user.id, {
      avatarUrl: avatar,
      accountId: authUser.id,
    });

    if (!hasUpdate) {
      return result.status(500).send(new ReporingError().toModel());
    }
  }
  return result.send(avatar);
};

const validateAddMoreInfoData = (data: IAddMoreInfosReq): string[] => {
  const errorDatas = {
    firstName: "First name is required",
    lastName: "Last name is required",
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  if (data.email && !hasEmail(data.email)) {
    message.push("Email is not correct");
  }
  if (data.phoneNumber && !hasPhoneNumber(data.phoneNumber)) {
    message.push("Phone number is not correct");
  }

  return message;
};

export const plusPointToUser = async (
  point: number,
  userId: number,
  message: string = "Cộng điểm từ thử thách"
): Promise<void> => {
  const points = await PointService.getByUserId(userId);

  if (points) {
    // plus point to user
    await PointService.update(userId, {
      point: points.point + point,
    }).catch((err) => {
      logger.error({ ...err, message: "Not save point", point: point, userId });
    });
  } else {
    // plus point to user
    await PointService.create({
      point: point,
      price: 0,
      userId: userId,
      createdBy: userId.toString(),
    }).catch((err) => {
      logger.error({ ...err, message: "Not save point", point: point, userId });
    });
  }

  // add history change point
  await PointHistoryService.create({
    deliveryId: null,
    description: message,
    point: points ? points.point + point : point,
    price: points ? points.price : 0,
    createdBy: userId.toString(),
  }).catch((err) => {
    logger.error({
      ...err,
      message: "Not save history point",
      point: point,
      userId,
    });
  });
};

export default {
  updateUserInfos,
  getUserInfo,
  getUserPoints,
  uploadAvatar,
  updatePassowrd,
  plusPointToUser,
};
