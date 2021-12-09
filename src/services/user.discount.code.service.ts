import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import { DiscountType } from '../models/discount.code.models';
import {
  ICreateUserDiscountCodeModels,
  IUserDiscountCodeModels,
} from '../models/user.discount.code.models';
import { getOrderQuery } from './helpers';

export interface IUserDiscountCodeRes {
  id: number;
  userId: number;
  code: string;
  name: string;
  description: string;
  avatarUrl: string;
  thumbUrl: string;
  brandName: string;
  brandUrl: string;
  brandThumbUrl: string;
  expireDate: string | Date;
  numberOfUses: number;
  createdDate: string | Date;
  updatedDate: string | Date;
  status: ObjectStatus;
  percentDiscount: number;
  discountAmount: number;
  maximumDiscountAmount: number;
  type: DiscountType;
}

export interface IUserDiscountCodeService {
  create: (
    models: ICreateUserDiscountCodeModels,
  ) => Promise<IUserDiscountCodeModels | null>;
  update: (
    id: number,
    params: ICreateUserDiscountCodeModels,
  ) => Promise<boolean>;
  getList: (
    params: BasePagingReq & { userId: number },
  ) => Promise<BasePagingRes<IUserDiscountCodeRes>>;
  toModel: (item: IUserDiscountCodeModels) => IUserDiscountCodeRes;
  getByCode: (code: string) => Promise<IUserDiscountCodeRes | null>;
  delete: (id: number) => Promise<boolean>;
}

const _userDiscountCodeContext = dbContext.UserDiscountCodeContext;

const create = async (
  models: ICreateUserDiscountCodeModels,
): Promise<IUserDiscountCodeModels | null> => {
  const res = await _userDiscountCodeContext
    .create({
      ...models,
      objectStatus: ObjectStatus.Active,
    })
    .catch((err) => {
      logger.error({
        ...err,
        data: models,
        message: 'Not save user discount code',
      });
    });

  if (res) {
    return res.get();
  }

  return null;
};
const update = async (
  id: number,
  models: ICreateUserDiscountCodeModels,
): Promise<boolean> => {
  const res = await _userDiscountCodeContext
    .update(
      { ...models },
      {
        where: { id },
      },
    )
    .catch((err) => {
      logger.error(err);
    });

  if (res && res[0] === 1) {
    return true;
  } else {
    return false;
  }
};
const getList = async (
  params: BasePagingReq & { userId: number },
): Promise<BasePagingRes<IUserDiscountCodeRes>> => {
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize)
    ? Number(params.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(params.pageSize)
    : 10;

  let option: any = {
    where: {},
    order: getOrderQuery(params.sortNames, params.sortDirections),
  };

  if (params.status) {
    option.where.objectStatus = params.status;
  }

  if (params.userId) {
    option.where.userId = params.userId;
  }

  if (!params.allItems) {
    option.limit = pageSize;
    option.offset = (page - 1) * pageSize;
  }

  const res = await _userDiscountCodeContext
    .findAndCountAll(option)
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    const usersDiscountCodes = res.rows.map((item) => toModel(item.get()));
    return {
      items: usersDiscountCodes,
      total: res.count,
      page: page,
      pageSize: pageSize,
    };
  }

  return {
    items: [],
    total: 0,
    page: page,
    pageSize: pageSize,
  };
};
const getByCode = async (
  code: string,
): Promise<IUserDiscountCodeRes | null> => {
  const res = await _userDiscountCodeContext
    .findOne({
      where: { code: code.toUpperCase() },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return toModel(res.get());

  return null;
};
const deleteAsync = async (id: number): Promise<boolean> => {
  const res = await _userDiscountCodeContext
    .destroy({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res === 1) {
    return true;
  } else {
    return false;
  }
};

const toModel = (item: IUserDiscountCodeModels): IUserDiscountCodeRes => {
  return {
    id: item.id,
    userId: item.userId,
    code: item.code,
    description: item.description,
    expireDate: item.expireDate,
    name: item.name,
    numberOfUses: item.numberOfUses,
    status: item.objectStatus,
    updatedDate: item.updatedAt,
    createdDate: item.createdAt,
    discountAmount: item.discountAmount,
    maximumDiscountAmount: item.maximumDiscountAmount,
    percentDiscount: item.percentDiscount,
    type: item.type,
    avatarUrl: item.avatarUrl,
    brandName: item.brandName,
    brandThumbUrl: item.brandThumbUrl,
    brandUrl: item.brandUrl,
    thumbUrl: item.thumbUrl,
  };
};

const UserDiscountCodeService: IUserDiscountCodeService = {
  create,
  update,
  getList,
  toModel,
  getByCode,
  delete: deleteAsync,
};

export default UserDiscountCodeService;
