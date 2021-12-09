import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import { ICreateProductModels, IProductModels } from '../models/product.models';
import { getOrderQuery } from './helpers';

export interface IGetProductReq extends BasePagingReq {
  categoryId?: number;
  skipIds?: number[];
}

export interface IProductRes {
  id: number;
  name: string;
  code: string;
  categoryId: number;
  cashPrice: number;
  pointsPrice: number;
  description: string;
  saleOff: number;
  size: string[];
  quantity: number;
  avatarUrl: string[];
  thumb: string;
  isLike: boolean;
  status: ObjectStatus;
  createdAt: string;
  updatedAt: string;
  categoryName: string;
  content: string;
}

export interface IProductService {
  create: (models: ICreateProductModels) => Promise<IProductModels | null>;
  getById: (id: number, userId?: number) => Promise<IProductRes | null>;
  getBySearchParams: (
    params: IGetProductReq,
    userId?: number,
  ) => Promise<BasePagingRes<IProductRes> | null>;
  getByIds: (ids: number[], userId?: number) => Promise<IProductRes[]>;
  update: (id: number, models: ICreateProductModels) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  toModel: (item: IProductModels, isLike: boolean) => IProductRes;
}

const _productContext = dbContext.ProductContext;

const create = async (
  models: ICreateProductModels,
): Promise<IProductModels> => {
  const res = await _productContext
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

const getById = async (
  id: number,
  userId?: number,
): Promise<IProductRes | null> => {
  let options: any = {
    where: { id },
    include: [],
  };

  if (userId) {
    options.include.push({
      model: dbContext.WishlistContext,
      required: false,
      where: {
        objectStatus: ObjectStatus.Active,
        userId: userId,
      },
    });
  }

  const res = await _productContext.findOne(options).catch((err) => {
    logger.error(err);
  });

  if (res) {
    const product = res.get();

    const isLike = (product as any).Wishlist ? true : false;

    return toModel(product, isLike);
  }

  return null;
};

const getBySearchParams = async (
  params: IGetProductReq,
  userId?: number,
): Promise<BasePagingRes<IProductRes> | null> => {
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize)
    ? Number(params.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(params.pageSize)
    : 10;

  let option: any = {
    where: {},
    order: getOrderQuery(params.sortNames, params.sortDirections),
    include: [
      {
        model: dbContext.ProductCategoryContext,
        required: false,
      },
    ],
  };

  if (params.status) {
    option.where.objectStatus = params.status;
  }
  if (params.skipIds && params.skipIds.length) {
    option.where.id = {
      [Op.notIn]: params.skipIds,
    };
  }

  if (userId) {
    option.include.push({
      model: dbContext.WishlistContext,
      required: false,
      where: {
        objectStatus: ObjectStatus.Active,
        userId: userId,
      },
    });
  }

  if (params.categoryId) option.where.categoryId = params.categoryId;
  if (params.keyword)
    option.where.name = {
      [Op.like]: `%${params.keyword}%`,
    };

  option.limit = pageSize;
  option.offset = (page - 1) * pageSize;

  const res = await _productContext.findAndCountAll(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    const products = res.rows.map((item) => item.get());

    let productsRes: IProductRes[] = [];

    for (let item of products) {
      const isLike = (item as any).Wishlist ? true : false;

      productsRes.push(toModel(item, isLike));
    }

    return {
      items: productsRes,
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
const getByIds = async (
  ids: number[],
  userId?: number,
): Promise<IProductRes[]> => {
  const option: any = {
    where: {
      id: { [Op.in]: ids },
      objectStatus: ObjectStatus.Active,
    },
    order: getOrderQuery(),
    include: [],
  };

  if (userId) {
    option.include.push({
      model: dbContext.WishlistContext,
      required: false,
      where: {
        objectStatus: ObjectStatus.Active,
        userId: userId,
      },
    });
  }

  const res = await _productContext.findAll(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    return res.map((item) => {
      const isLike = (item as any).Wishlist ? true : false;
      return toModel(item.get(), isLike);
    });
  }

  return [];
};

const update = async (
  id: number,
  models: ICreateProductModels,
): Promise<boolean> => {
  const res = await _productContext
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
  const res = await _productContext
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
  const res = await _productContext
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

const toModel = (item: IProductModels, isLike: boolean): IProductRes => {
  return {
    id: item.id,
    cashPrice: item.cashPrice,
    categoryId: item.categoryId,
    description: item.description,
    code: item.code,
    name: item.name,
    pointsPrice: item.pointsPrice,
    quantity: item.quantity,
    saleOff: item.saleOff,
    size: item.size ? item.size.split(',') : [],
    avatarUrl: item.avatarUrl ? item.avatarUrl.split(';') : [],
    thumb: item.thumb,
    isLike: isLike,
    status: item.objectStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    categoryName: (item as any)?.ProductCategory?.name || '',
    content: item.content,
  };
};

const ProductService: IProductService = {
  create,
  getBySearchParams,
  getByIds,
  getById,
  update,
  disabled,
  toModel,
  delete: deleteAsync,
};

export default ProductService;
