import { MAX_PAGE_SIZE } from '../config';
import { IGetWishlistReq } from '../controllers/user.controller';
import logger from '../logs/logger';
import dbContext from '../models';
import { BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateWishlistModels,
  IWishlistModels,
} from '../models/wishlist.models';
import { getOrderQuery } from './helpers';

export interface IWishlistRes {
  id: number;
  userId: number;
  productId: number;
}

export interface IWishlistService {
  create: (models: ICreateWishlistModels) => Promise<IWishlistModels | null>;
  getById: (id: number) => Promise<IWishlistModels | null>;
  getByProductId: (productId: number) => Promise<IWishlistModels[]>;
  getByUserId: (
    userId: number,
    params: IGetWishlistReq,
  ) => Promise<BasePagingRes<IWishlistModels> | null>;
  update: (id: number, models: ICreateWishlistModels) => Promise<boolean>;
  disabled: (id: number) => Promise<boolean>;
  hasLiked: (productId: number, userId: number) => Promise<boolean>;
  toModel: (item: IWishlistModels) => IWishlistRes;
  getByUserAndProductId: (
    productId: number,
    userId: number,
  ) => Promise<IWishlistModels | null>;
}

const _wishlistContext = dbContext.WishlistContext;

const create = async (
  models: ICreateWishlistModels,
): Promise<IWishlistModels> => {
  const res = await _wishlistContext
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

const getById = async (id: number): Promise<IWishlistModels | null> => {
  const res = await _wishlistContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getByProductId = async (
  productId: number,
): Promise<IWishlistModels[]> => {
  const res = await _wishlistContext
    .findAll({ where: { productId, objectStatus: ObjectStatus.Active } })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((item) => item.get());

  return [];
};
const getByUserId = async (
  userId: number,
  params: IGetWishlistReq,
): Promise<BasePagingRes<IWishlistModels> | null> => {
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize)
    ? Number(params.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(params.pageSize)
    : 10;

  let option: any = {
    where: {
      userId: userId,
      objectStatus: ObjectStatus.Active,
    },
    order: getOrderQuery(params.sortNames, params.sortDirections),
  };

  option.limit = pageSize;
  option.offset = (page - 1) * pageSize;

  const res = await _wishlistContext.findAndCountAll(option).catch((err) => {
    logger.error(err);
  });

  if (res)
    return {
      items: res.rows.map((a) => a.get()),
      total: res.count,
      page: page,
      pageSize: pageSize,
    };

  return {
    items: [],
    total: 0,
    page: page,
    pageSize: pageSize,
  };
};

const hasLiked = async (
  productId: number,
  userId: number,
): Promise<boolean> => {
  const res = await _wishlistContext
    .findOne({
      where: { userId, productId, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return true;

  return false;
};

const getByUserAndProductId = async (
  productId: number,
  userId: number,
): Promise<IWishlistModels | null> => {
  const res = await _wishlistContext
    .findOne({
      where: { userId, productId, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};

const update = async (
  id: number,
  models: ICreateWishlistModels,
): Promise<boolean> => {
  const res = await _wishlistContext
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

const disabled = async (id: number): Promise<boolean> => {
  const res = await _wishlistContext
    .update(
      { objectStatus: ObjectStatus.DeActive },
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

const toModel = (item: IWishlistModels): IWishlistRes => {
  return {
    id: item.id,
    productId: item.productId,
    userId: item.userId,
  };
};

const WishlistService: IWishlistService = {
  create,
  getByProductId,
  getByUserId,
  getById,
  update,
  disabled,
  toModel,
  hasLiked,
  getByUserAndProductId,
};

export default WishlistService;
