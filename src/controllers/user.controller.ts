import { hasEmail } from './../helpers/index';
import { Request, Response } from 'express';
import { hasPhoneNumber } from '../helpers';
import { checkAuthentication } from '../helpers/authentication.helpers';
import { ICreateDeliveryAddressModels } from '../models/delivery.address.models';
import DeliveryAddressService, {
  IDeliveryAddressRes,
} from '../services/delivery.address.service';
import { ReporingError, UnauthorizedError } from '../utils/error';
import PointService from '../services/point.service';
import { IAddMoreInfosReq } from './auth.controllers';
import UserService from '../services/user.service';
import WishlistService from '../services/wishlist.service';
import ProductService from '../services/product.service';
import { BasePagingReq } from '../models/common/models.type';
import { ObjectStatus, OrderDirection } from '../models/common/models.enum';
import UserChallengenService from '../services/user.challenge.service';
import HistoryRunService from '../services/history.run.service';
import ArticleWishlistService from '../services/article.wishlist.service';
import ArticleService from '../services/article.service';
import uploadFileMiddleware from '../utils/upload';
import fs from 'fs';
import { envConfig } from '../config/env.config';
import AccountService from '../services/account.service';
import { BCryptHasher } from '../utils/hasher';
import { ICreateUserModels } from '../models/users.models';
import UserDiscountCodeService from '../services/user.discount.code.service';
import {
  ChallengeStatus,
  IUserChallengeModels,
} from '../models/user.challenge.models';
import moment from 'moment';
import ChallengeService from '../services/challenges.service';
import logger from '../logs/logger';
import PointHistoryService from '../services/point.history.service';
import ProvinceService from '../services/province.service';
import DistrictService from '../services/district.service';
import WardService from '../services/ward.service';

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

const getDeliveryAddresses = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const addresses = await DeliveryAddressService.getByUserId(authUser.id);

  const addressRes: IDeliveryAddressRes[] = [];

  for (const address of addresses) {
    let moreData = {
      provinceName: '',
      districtName: '',
      wardName: '',
    };

    const province = await ProvinceService.getByCode(address.provinceCode);
    if (province) {
      moreData.provinceName = province.name;
    }
    const district = await DistrictService.getByCode(address.districtCode);
    if (district) {
      moreData.districtName = district.name;
    }
    const ward = await WardService.getByCode(address.wardsCode);
    if (ward) {
      moreData.wardName = ward.name;
    }

    addressRes.push(DeliveryAddressService.toModel(address, moreData));
  }

  return result.send(addressRes);
};

const createDeliveryAddresses = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: IDeliveryAddressReq = request.body;

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errMessage = validateDeliveryAddress(data);

  if (errMessage.length) {
    return result.status(400).send({ message: errMessage.join(', ') });
  }

  const params: ICreateDeliveryAddressModels = {
    address: data.address.trim(),
    email: data.email.trim(),
    phoneNumber: data.phoneNumber.trim(),
    userId: authUser.id,
    createdBy: authUser.id.toString(),
    fullName: data.fullName.trim(),
    isDefault: data.isDefault ? data.isDefault : false,
    provinceCode: data.provinceCode,
    districtCode: data.districtCode,
    wardsCode: data.wardsCode,
  };

  const address = await DeliveryAddressService.create(params);

  let moreData = {
    provinceName: '',
    districtName: '',
    wardName: '',
  };

  const province = await ProvinceService.getByCode(address.provinceCode);
  if (province) {
    moreData.provinceName = province.name;
  }
  const district = await DistrictService.getByCode(address.districtCode);
  if (district) {
    moreData.districtName = district.name;
  }
  const ward = await WardService.getByCode(address.wardsCode);
  if (ward) {
    moreData.wardName = ward.name;
  }

  if (data.isDefault) {
    await setDefaultAddress(address.id, authUser.id);
  }

  return result.send(DeliveryAddressService.toModel(address, moreData));
};

const updateDeliveryAddress = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: IDeliveryAddressReq & { addressId: number } = request.body;

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errMessage = validateDeliveryAddress(data);

  if (errMessage.length) {
    return result.status(400).send({ message: errMessage.join(', ') });
  }

  const params: ICreateDeliveryAddressModels = {
    address: data.address.trim(),
    email: data.email.trim(),
    phoneNumber: data.phoneNumber.trim(),
    userId: authUser.id,
    fullName: data.fullName.trim(),
    isDefault: data.isDefault ? data.isDefault : false,
    provinceCode: data.provinceCode,
    districtCode: data.districtCode,
    wardsCode: data.wardsCode,
  };

  const address = await DeliveryAddressService.update(data.addressId, params);

  if (!address) return result.status(500).send(new ReporingError().toModel());

  if (data.isDefault) await setDefaultAddress(data.addressId, authUser.id);

  return result.send({ message: 'Update address successfully' });
};

const deleteDeliveryAddress = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const deliveryAddressId = Number(request.params.deliveryAddressId);

  const address = await DeliveryAddressService.getById(deliveryAddressId);

  if (!address) {
    return result.send(true);
  }
  if (address.userId !== authUser.id) {
    result.status(400).send({ message: 'Bạn không thể xoá địa chỉ này!' });
  }

  const hasDelete = await DeliveryAddressService.delete(deliveryAddressId);

  if (!hasDelete) return result.status(400).send({ message: 'Không thể xoá!' });

  return result.send(true);
};

// Create and save new user
const updateUserInfos = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: IAddMoreInfosReq = request.body;

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage = validateAddMoreInfoData(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
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

  return result.send({ message: 'Update user info' });
};

const getUserInfo = async (
  request: Request,
  result: Response,
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

  const currentChallenge = await UserChallengenService.getCurrent(authUser.id);

  let totalUserRun = 0;
  let isDone = false;

  if (currentChallenge && currentChallenge.isPaid) {
    isDone = await checkChallengeIsDone(currentChallenge);

    totalUserRun = await HistoryRunService.getTotalRunValue(
      currentChallenge ? currentChallenge.id : null,
      {
        startDate: currentChallenge.startDate,
        endDate: currentChallenge.endDate,
      },
    );
  }

  if (!user) {
    return result.status(500).send(new ReporingError().toModel());
  }

  // get default address
  const address = await DeliveryAddressService.getDefault(authUser.id);
  let addressName = {
    provinceName: '',
    districtName: '',
    wardName: '',
  };
  if (address) {
    const province = await ProvinceService.getByCode(address.provinceCode);
    if (province) {
      addressName.provinceName = province.name;
    }
    const district = await DistrictService.getByCode(address.districtCode);
    if (district) {
      addressName.districtName = district.name;
    }
    const ward = await WardService.getByCode(address.wardsCode);
    if (ward) {
      addressName.wardName = ward.name;
    }
  }
  const addressRes = address
    ? { ...DeliveryAddressService.toModel(address, addressName) }
    : null;

  const thisDate = new Date();

  return result.send({
    ...UserService.toModel(user, currentChallenge, totalUserRun),
    hasCurrentChallenge: isDone ? false : !!currentChallenge?.isPaid,
    username: account.username,
    role: account.role,
    referralCode: account.referralCode,
    defaultAddress: addressRes,
    isBeforeStartDate: currentChallenge
      ? thisDate < new Date(currentChallenge.startDate)
      : false,
  });
};

const checkChallengeIsDone = async (
  currentChallenge: IUserChallengeModels,
): Promise<boolean> => {
  const thisDay = moment(new Date()).toDate();
  const endDate = moment(currentChallenge.endDate).toDate();

  if (thisDay > endDate) {
    const challenge = await ChallengeService.getById(
      currentChallenge.challengesId,
    );
    // total run
    const totalUserRun = await HistoryRunService.getTotalRunValue(
      currentChallenge.id,
      {
        startDate: currentChallenge.startDate,
        endDate: currentChallenge.endDate,
      },
    );
    // check if completed
    if (challenge.totalRun <= totalUserRun) {
      const points = challenge.price + challenge.totalRun * 100;
      // plus points to user
      await plusPointToUser(points, currentChallenge.userId);

      // update user challenge status
      await UserChallengenService.update(currentChallenge.id, {
        status: ChallengeStatus.Completed,
        isCurrentChallenge: false,
      });
    }
    // check if not completed
    else {
      // update user challenge status
      await UserChallengenService.update(currentChallenge.id, {
        status: ChallengeStatus.NotCompleted,
        isCurrentChallenge: false,
      });
    }

    return true;
  }

  return false;
};

const getUserPoints = async (
  request: Request,
  result: Response,
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

const getWishlist = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const query = request.query;

  const params: IGetWishlistReq = {
    page: Number(query.page),
    pageSize: Number(query.pageSize),
    sortDirections: (query.sortDirections as OrderDirection[]) || [],
    sortNames: (query.sortNames as string[]) || [],
  };

  const wishlist = await WishlistService.getByUserId(authUser.id, params);
  if (!wishlist) {
    result.status(500).send(new ReporingError().toModel());
  }

  const products = await ProductService.getByIds(
    wishlist.items.map((item) => item.productId),
  );

  return result.send({ ...wishlist, items: products });
};

const getArticleWishlist = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const query = request.query;

  const params: IGetWishlistReq = {
    page: Number(query.page),
    pageSize: Number(query.pageSize),
    sortDirections: (query.sortDirections as OrderDirection[]) || [],
    sortNames: (query.sortNames as string[]) || [],
  };

  const wishlist = await ArticleWishlistService.getByUserId(
    authUser.id,
    params,
  );

  if (!wishlist) {
    result.status(500).send(new ReporingError().toModel());
  }

  const articles = await ArticleService.getByIds(
    wishlist.items.map((item) => item.articleId),
    authUser.id,
  );

  return result.send({ ...wishlist, items: articles });
};

const updatePassowrd = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: { oldPassword: string; newPassword: string } = request.body;

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  if (!data.newPassword) {
    return result.status(400).send({
      message: 'New password is required',
    });
  }
  const account = await AccountService.getById(authUser.id);
  if (!account) {
    return result.status(400).send({ message: 'Account not found' });
  }

  if (
    !(await _bCryptHasher.verifyPassword(data.oldPassword, account.password))
  ) {
    return result.status(400).send({ message: 'Incorrect password' });
  }

  if (await _bCryptHasher.verifyPassword(data.newPassword, account.password)) {
    return result
      .status(400)
      .send({ message: 'New password should not same old password' });
  }

  // hash password
  const passwordHash = await _bCryptHasher.hashPassword(data.newPassword);

  const hasUpdate = await AccountService.updatePassword(
    authUser.id,
    passwordHash,
    authUser.id,
  );

  if (!hasUpdate) return result.status(500).send(new ReporingError().toModel());

  return result.send({ message: 'Success' });
};

const uploadAvatar = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const path = 'users/avatars';
  const directoryPath = `uploads/${path}`;

  const dp = directoryPath.split('/');
  let directoryPathCreate = '';

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
    result.status(400).send({ message: 'Not found file' });
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

const getDiscountCodes = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const query = request.query;

  const params: BasePagingReq & { userId: number } = {
    page: Number(query.page),
    pageSize: Number(query.pageSize),
    sortDirections: (query.sortDirections as OrderDirection[]) || [],
    sortNames: (query.sortNames as string[]) || [],
    userId: authUser.id,
    status: ObjectStatus.Active,
  };

  const discountCodes = await UserDiscountCodeService.getList(params);

  if (!discountCodes) {
    result.status(500).send(new ReporingError().toModel());
  }

  return result.send(discountCodes);
};

const validateAddMoreInfoData = (data: IAddMoreInfosReq): string[] => {
  const errorDatas = {
    firstName: 'First name is required',
    lastName: 'Last name is required',
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  if (data.email && !hasEmail(data.email)) {
    message.push('Email is not correct');
  }
  if (data.phoneNumber && !hasPhoneNumber(data.phoneNumber)) {
    message.push('Phone number is not correct');
  }

  return message;
};

const validateDeliveryAddress = (data: IDeliveryAddressReq): string[] => {
  let message: string[] = [];

  if (!data.address) {
    message.push('Address is required');
  }
  if (!hasPhoneNumber(data.phoneNumber)) {
    message.push('Invalid phone number');
  }
  if (!data.email || (data.email && !hasEmail(data.email))) {
    message.push('Invalid email');
  }
  if (!data.fullName) {
    message.push('Invalid fullName');
  }
  if (!data.provinceCode) {
    message.push('Invalid provinceCode');
  }
  if (!data.districtCode) {
    message.push('Invalid districtCode');
  }
  if (!data.wardsCode) {
    message.push('Invalid wardsCode');
  }

  return message;
};

export const plusPointToUser = async (
  point: number,
  userId: number,
  message: string = 'Cộng điểm từ thử thách',
): Promise<void> => {
  const points = await PointService.getByUserId(userId);

  if (points) {
    // plus point to user
    await PointService.update(userId, {
      point: points.point + point,
    }).catch((err) => {
      logger.error({ ...err, message: 'Not save point', point: point, userId });
    });
  } else {
    // plus point to user
    await PointService.create({
      point: point,
      price: 0,
      userId: userId,
      createdBy: userId.toString(),
    }).catch((err) => {
      logger.error({ ...err, message: 'Not save point', point: point, userId });
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
      message: 'Not save history point',
      point: point,
      userId,
    });
  });
};

const setDefaultAddress = async (skipId: number, userId: number) => {
  const addresses = await DeliveryAddressService.getByUserId(userId);

  const addressesSetNotDefault = addresses.filter(
    (address) => address.id !== skipId,
  );

  for (const address of addressesSetNotDefault) {
    await DeliveryAddressService.update(address.id, { isDefault: false });
  }
};

export default {
  getDeliveryAddresses,
  createDeliveryAddresses,
  updateDeliveryAddress,
  updateUserInfos,
  getUserInfo,
  getUserPoints,
  getWishlist,
  getArticleWishlist,
  uploadAvatar,
  updatePassowrd,
  getDiscountCodes,
  plusPointToUser,
  deleteDeliveryAddress,
};
