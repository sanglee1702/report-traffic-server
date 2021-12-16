import { Op } from "sequelize";
import { MAX_PAGE_SIZE } from "../config";
import logger from "../logs/logger";
import dbContext from "../models";
import { BasePagingReq, BasePagingRes } from "../models/common/models.type";
import { ObjectStatus } from "../models/common/models.enum";
import { getOrderQuery } from "./helpers";
import {
  ICategoryModels,
  ICreateCategoryModels,
} from "../models/category.models";

export interface ICategoryRes {
  id: number;
  name: string;
  code: string;
  level: string;
  parentId?: number;
  groupId?: number;
  status: ObjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ICategoryService {
  create: (models: ICreateCategoryModels) => Promise<ICategoryModels | null>;
  update: (id: number, models: ICreateCategoryModels) => Promise<boolean>;
  getById: (id: number) => Promise<ICategoryModels | null>;
  getList: (
    params: BasePagingReq
  ) => Promise<BasePagingRes<ICategoryModels> | null>;
  disabled: (id: number) => Promise<boolean>;
  toModel: (category: ICategoryModels) => ICategoryRes;
  delete: (id: number) => Promise<boolean>;
}

const _categoryContext = dbContext.CategoriesContext;

const create = async (
  models: ICreateCategoryModels
): Promise<ICategoryModels> => {
  const res = await _categoryContext
    .create({ ...models, objectStatus: ObjectStatus.Active })
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return res.get();
  }

  return null;
};

const update = async (
  id: number,
  models: ICreateCategoryModels
): Promise<boolean> => {
  const res = await _categoryContext
    .update(
      { ...models },
      {
        where: { id },
      }
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

const getById = async (id: number): Promise<ICategoryModels | null> => {
  const res = await _categoryContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return res.get();
  }

  return null;
};

const getList = async (
  params: BasePagingReq
): Promise<BasePagingRes<ICategoryModels> | null> => {
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize)
    ? Number(params.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(params.pageSize)
    : 10;

  let option: any = {
    where: {},
    order: getOrderQuery(params.sortNames, params.sortDirections),
    include: [],
  };

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

  const res = await _categoryContext.findAndCountAll(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    return {
      items: res.rows.map((item) => item.get()),
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

const disabled = async (id: number): Promise<boolean> => {
  const res = await _categoryContext
    .update(
      { objectStatus: ObjectStatus.DeActive },
      {
        where: { id },
      }
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
  const res = await _categoryContext
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

const toModel = (_category: ICategoryModels): ICategoryRes => {
  const category: ICategoryRes = {
    id: _category.id,
    name: _category.name,
    code: _category.code,
    level: _category.level,
    parentId: _category.parentId,
    groupId: _category.groupId,
    status: _category.objectStatus,
    createdAt: _category.createdAt,
    updatedAt: _category.updatedAt,
  };

  return category;
};

const CategoryService: ICategoryService = {
  create,
  getById,
  update,
  getList,
  disabled,
  toModel,
  delete: deleteAsync,
};

export default CategoryService;
