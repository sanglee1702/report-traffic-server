import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateProductCategoryModels,
  ProductCategoryModels,
} from '../models/product.category.models';
import { getOrderQuery } from './helpers';
import ProductService, { IProductRes } from './product.service';

export interface IProductCategoryRes {
  id: number;
  name: string;
  avatarUrl: string;
  code: string;
  mainCategoryId: number;
  createdAt: string;
  updatedAt: string;
  status: ObjectStatus;
  mainCategoryName: string;
  products?: IProductRes[];
}

export interface IProductCategoryService {
  create: (
    models: ICreateProductCategoryModels,
  ) => Promise<ProductCategoryModels | null>;
  getById: (id: number) => Promise<ProductCategoryModels | null>;
  getList: (
    params: BasePagingReq & { mainCategoryId: number },
    isAdmin: boolean,
  ) => Promise<BasePagingRes<ProductCategoryModels> | null>;
  update: (
    id: number,
    models: ICreateProductCategoryModels,
  ) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  toModel: (item: ProductCategoryModels) => IProductCategoryRes;
}

const _productCategoryContext = dbContext.ProductCategoryContext;

const create = async (
  models: ICreateProductCategoryModels,
): Promise<ProductCategoryModels> => {
  const res = await _productCategoryContext
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

const getById = async (id: number): Promise<ProductCategoryModels | null> => {
  const res = await _productCategoryContext
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
  params: BasePagingReq & {
    mainCategoryId: number;
  },
  isAdmin: boolean = false,
): Promise<BasePagingRes<ProductCategoryModels> | null> => {
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
        model: dbContext.ProductMainCategoryContext,
        required: false,
      },
    ],
  };

  if (isAdmin) {
    option.include.push({
      model: dbContext.ProductContext,
      required: false,
    });
  }

  if (params.status) {
    option.where.objectStatus = params.status;
  }
  if (params.keyword)
    option.where.name = {
      [Op.like]: `%${params.keyword}%`,
    };

  if (params.mainCategoryId)
    option.where.mainCategoryId = params.mainCategoryId;

  if (!params.allItems) {
    option.limit = pageSize;
    option.offset = (page - 1) * pageSize;
  }

  const res = await _productCategoryContext
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
  models: ICreateProductCategoryModels,
): Promise<boolean> => {
  const res = await _productCategoryContext
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
  const res = await _productCategoryContext
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
  const res = await _productCategoryContext
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
  item: ProductCategoryModels,
  isAdmin: boolean = false,
): IProductCategoryRes => {
  const category: IProductCategoryRes = {
    id: item.id,
    code: item.code,
    name: item.name,
    avatarUrl: item.avatarUrl,
    mainCategoryId: item.mainCategoryId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    status: item.objectStatus,
    mainCategoryName: (item as any)?.ProductMainCategory?.name || '',
  };
  if (isAdmin) {
    category.products = (item as any).Products.map((product) =>
      ProductService.toModel(product, false),
    );
  }

  return category;
};

const ProductCategoryService: IProductCategoryService = {
  create,
  getList,
  getById,
  update,
  disabled,
  toModel,
  delete: deleteAsync,
};

export default ProductCategoryService;
