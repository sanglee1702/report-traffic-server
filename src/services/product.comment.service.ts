import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateProductCommentModels,
  IProductCommentModels,
} from '../models/product.comment.models';
import { getOrderQuery } from './helpers';

export interface IProductCommentRes {
  id: number;
  title: string;
  comment: string;
  userId: number;
  star: number;
  nameUserComment: string;
  email: string;
  productId: number;
  createdDate: string | Date;
  updatedDate: string | Date;
}

export interface IGetProductCommnetReq extends BasePagingReq {
  productId: number;
}

export interface IProductCommentService {
  create: (
    models: ICreateProductCommentModels,
  ) => Promise<IProductCommentModels | null>;
  getById: (id: number) => Promise<IProductCommentModels | null>;
  getByProductId: (
    params: IGetProductCommnetReq,
  ) => Promise<BasePagingRes<IProductCommentModels> | null>;
  getByUserId: (userId: number) => Promise<IProductCommentModels[]>;
  update: (id: number, models: ICreateProductCommentModels) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  toModel: (item: IProductCommentModels) => IProductCommentRes;
  averageStar: (productId: number) => Promise<number>;
}

const _productCommentContext = dbContext.ProductCommentContext;

const create = async (
  models: ICreateProductCommentModels,
): Promise<IProductCommentModels> => {
  const res = await _productCommentContext
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

const getById = async (id: number): Promise<IProductCommentModels | null> => {
  const res = await _productCommentContext
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
  params: IGetProductCommnetReq,
): Promise<BasePagingRes<IProductCommentModels> | null> => {
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize)
    ? Number(params.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(params.pageSize)
    : 10;

  let option: any = {
    where: {
      objectStatus: ObjectStatus.Active,
    },
    order: getOrderQuery(params.sortNames, params.sortDirections),
  };

  option.limit = pageSize;
  option.offset = (page - 1) * pageSize;

  if (params.productId) option.where.productId = params.productId;

  const res = await _productCommentContext
    .findAndCountAll(option)
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return {
      items: res.rows.map((row) => row.get()),
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

const getByUserId = async (
  userId: number,
): Promise<IProductCommentModels[]> => {
  const res = await _productCommentContext
    .findAll({
      where: { userId, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((item) => item.get());

  return [];
};

const update = async (
  id: number,
  models: ICreateProductCommentModels,
): Promise<boolean> => {
  const res = await _productCommentContext
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
  const res = await _productCommentContext
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

const toModel = (item: IProductCommentModels): IProductCommentRes => {
  return {
    id: item.id,
    title: item.title,
    email: item.email,
    comment: item.comment,
    productId: item.productId,
    nameUserComment: item.nameUserComment,
    star: item.star,
    userId: item.userId,
    createdDate: item.createdAt,
    updatedDate: item.updatedAt,
  };
};

const averageStar = async (productId: number): Promise<number> => {
  const res = await _productCommentContext
    .findAll({
      where: { productId, objectStatus: ObjectStatus.Active },
      attributes: ['star'],
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res && res.length) {
    const comments = res.map((item) => item.get());

    let total = 0;

    for (const comment of comments) {
      total += comment.star;
    }

    return Number((total / comments.length).toFixed(2));
  }

  return null;
};

const ProductCommentService: IProductCommentService = {
  create,
  getByProductId,
  getByUserId,
  getById,
  update,
  disabled,
  toModel,
  averageStar,
};

export default ProductCommentService;
