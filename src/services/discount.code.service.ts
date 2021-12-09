import moment from 'moment';
import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import {
  DiscountType,
  ICreateDiscountCodeModels,
  IDiscountCodeModels,
} from '../models/discount.code.models';
import { getOrderQuery } from './helpers';

export interface IDiscountCodeRes {
  id: number;
  code: string;
  name: string;
  description: string;
  expireDate: string | Date;
  numberOfUses: number;
  status: ObjectStatus;
  createdAt: string;
  updatedAt: string;
  percentDiscount: number;
  discountAmount: number;
  maximumDiscountAmount: number;
  type: DiscountType;
  avatarUrl: string;
  thumbUrl: string;
  brandName: string;
  brandUrl: string;
  brandThumbUrl: string;
}

export interface IDiscountCodeService {
  create: (
    models: ICreateDiscountCodeModels,
  ) => Promise<IDiscountCodeModels | null>;
  getById: (id: number) => Promise<IDiscountCodeRes | null>;
  getByCode: (code: string) => Promise<IDiscountCodeRes | null>;
  getList: (
    params: BasePagingReq & { code?: string; hasNotExpired?: boolean },
  ) => Promise<BasePagingRes<IDiscountCodeRes>>;
  update: (id: number, models: ICreateDiscountCodeModels) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  toModel: (item: IDiscountCodeModels) => IDiscountCodeRes;
  delete: (id: number) => Promise<boolean>;
}

const _discountCodeContext = dbContext.DiscountCodeContext;

const create = async (
  models: ICreateDiscountCodeModels,
): Promise<IDiscountCodeModels> => {
  const res = await _discountCodeContext
    .create({
      ...models,
      objectStatus: ObjectStatus.Active,
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return res.get();
  }

  return null;
};

const getById = async (id: number): Promise<IDiscountCodeRes | null> => {
  const res = await _discountCodeContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return toModel(res.get());

  return null;
};
const getByCode = async (code: string): Promise<IDiscountCodeRes | null> => {
  const res = await _discountCodeContext
    .findOne({
      where: { code },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return toModel(res.get());

  return null;
};
const getList = async (
  params: BasePagingReq & { code?: string; hasNotExpired?: boolean },
): Promise<BasePagingRes<IDiscountCodeRes>> => {
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
  if (params.code) {
    option.where.code = params.code;
  }
  if (params.keyword)
    option.where.name = {
      [Op.like]: `%${params.keyword}%`,
    };
  if (params.code)
    option.where.name = {
      [Op.like]: `%${params.code}%`,
    };

  if (!params.allItems) {
    if (Number(params.pageSize)) option.limit = pageSize;
    if (params.page) option.offset = (page - 1) * pageSize;
  }

  if (params.hasNotExpired) {
    option.where.expireDate = {
      [Op.gte]: moment().subtract(3, 'days').toDate(),
    };
  }

  const res = await _discountCodeContext
    .findAndCountAll(option)
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    const giftboxs = res.rows.map((item) => toModel(item.get()));
    return {
      items: giftboxs,
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

const update = async (
  id: number,
  models: ICreateDiscountCodeModels,
): Promise<boolean> => {
  const res = await _discountCodeContext
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

const disabled = async (id: number, userId: number): Promise<boolean> => {
  const res = await _discountCodeContext
    .update(
      { objectStatus: ObjectStatus.DeActive, updatedBy: userId.toString() },
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
const deleteAsync = async (id: number): Promise<boolean> => {
  const res = await _discountCodeContext
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

const toModel = (item: IDiscountCodeModels): IDiscountCodeRes => {
  return {
    id: item.id,
    name: item.name,
    code: item.code,
    description: item.description,
    status: item.objectStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    expireDate: item.expireDate,
    numberOfUses: item.numberOfUses,
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

const DiscountCodeService: IDiscountCodeService = {
  create,
  getList,
  getById,
  update,
  disabled,
  toModel,
  delete: deleteAsync,
  getByCode,
};

export default DiscountCodeService;
