import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateMainCategoryModels,
  IMainCategoryModels,
} from '../models/product.main.category.models';
import { getOrderQuery } from './helpers';
import ProductCategoryService, {
  IProductCategoryRes,
} from './product.category.service';

export interface IProductMainCategoryRes {
  id: number;
  name: string;
  avatarUrl: string;
  code: string;
  status: ObjectStatus;
  createdAt: string;
  updatedAt: string;
  productCategories?: IProductCategoryRes[];
}

export interface IProductMainCategoryService {
  create: (
    models: ICreateMainCategoryModels,
  ) => Promise<IMainCategoryModels | null>;
  getById: (id: number) => Promise<IMainCategoryModels | null>;
  getList: (
    params: BasePagingReq,
    isAdmin: boolean,
  ) => Promise<BasePagingRes<IMainCategoryModels> | null>;
  update: (id: number, models: ICreateMainCategoryModels) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  toModel: (item: IMainCategoryModels) => IProductMainCategoryRes;
}

const _productMainCategoryContext = dbContext.ProductMainCategoryContext;

const create = async (
  models: ICreateMainCategoryModels,
): Promise<IMainCategoryModels> => {
  const res = await _productMainCategoryContext
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

const getById = async (id: number): Promise<IMainCategoryModels | null> => {
  const res = await _productMainCategoryContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};

const getList = async (
  params: BasePagingReq,
  isAdmin: boolean = false,
): Promise<BasePagingRes<IMainCategoryModels> | null> => {
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

  if (isAdmin) {
    option.include = [
      {
        model: dbContext.ProductCategoryContext,
        required: false,
      },
    ];
  }
  if (params.status) {
    option.where.objectStatus = params.status;
  }
  if (params.keyword)
    option.where.name = {
      [Op.like]: `%${params.keyword}%`,
    };

  if (!params.allItems) {
    option.limit = pageSize;
    option.offset = (page - 1) * pageSize;
  }

  const res = await _productMainCategoryContext
    .findAndCountAll(option)
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    const productsMain = res.rows.map((item) => toModel(item.get(), isAdmin));
    return {
      items: productsMain,
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
  models: ICreateMainCategoryModels,
): Promise<boolean> => {
  const res = await _productMainCategoryContext
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
  const res = await _productMainCategoryContext
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
  const res = await _productMainCategoryContext
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
const toModel = (
  item: IMainCategoryModels,
  isAdmin: boolean = false,
): IProductMainCategoryRes => {
  const params: IProductMainCategoryRes = {
    id: item.id,
    code: item.code,
    name: item.name,
    avatarUrl: item.avatarUrl,
    status: item.objectStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };

  if (isAdmin) {
    params.productCategories = (item as any).ProductCategories.map((category) =>
      ProductCategoryService.toModel(category),
    );
  }

  return params;
};

const ProductMainCategoryService: IProductMainCategoryService = {
  create,
  getList,
  getById,
  update,
  disabled,
  toModel,
  delete: deleteAsync,
};

export default ProductMainCategoryService;
