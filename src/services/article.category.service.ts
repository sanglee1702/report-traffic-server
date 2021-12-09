import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import {
  IArticleCategoryModels,
  ICreateArticleCategoryModels,
} from '../models/article.category.models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import ArticleService, { IArticleRes } from './article.service';
import { getOrderQuery } from './helpers';

export interface IArticleCategoryRes {
  id: number;
  name: string;
  avatarUrl: string;
  code: string;
  status: ObjectStatus;
  createdAt: string;
  updatedAt: string;
  articles?: IArticleRes[];
}

export interface IArticleCategoryService {
  create: (
    models: ICreateArticleCategoryModels,
  ) => Promise<IArticleCategoryModels | null>;
  update: (
    id: number,
    models: ICreateArticleCategoryModels,
  ) => Promise<boolean>;
  getById: (id: number) => Promise<IArticleCategoryModels | null>;
  getList: (
    params: BasePagingReq,
    isAdmin: boolean,
  ) => Promise<BasePagingRes<IArticleCategoryModels> | null>;
  disabled: (id: number) => Promise<boolean>;
  toModel: (articleCategory: IArticleCategoryModels) => IArticleCategoryRes;
  delete: (id: number) => Promise<boolean>;
}

const _articleCategoryContextContext = dbContext.ArticleCategoryContext;

const create = async (
  models: ICreateArticleCategoryModels,
): Promise<IArticleCategoryModels> => {
  const res = await _articleCategoryContextContext
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
  models: ICreateArticleCategoryModels,
): Promise<boolean> => {
  const res = await _articleCategoryContextContext
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

const getById = async (id: number): Promise<IArticleCategoryModels | null> => {
  const res = await _articleCategoryContextContext
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
  params: BasePagingReq,
  isAdmin: boolean = false,
): Promise<BasePagingRes<IArticleCategoryModels> | null> => {
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

  if (isAdmin) {
    option.include.push({
      model: dbContext.ArticleContext,
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

  if (!params.allItems) {
    option.limit = pageSize;
    option.offset = (page - 1) * pageSize;
  }

  const res = await _articleCategoryContextContext
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

const disabled = async (id: number): Promise<boolean> => {
  const res = await _articleCategoryContextContext
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

const deleteAsync = async (id: number): Promise<boolean> => {
  const res = await _articleCategoryContextContext
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
  articleCategory: IArticleCategoryModels,
  isAdmin: boolean = false,
): IArticleCategoryRes => {
  const category: IArticleCategoryRes = {
    id: articleCategory.id,
    name: articleCategory.name,
    avatarUrl: articleCategory.avatarUrl,
    code: articleCategory.code,
    status: articleCategory.objectStatus,
    createdAt: articleCategory.createdAt,
    updatedAt: articleCategory.updatedAt,
  };
  if (isAdmin) {
    category.articles = (articleCategory as any).Articles.map((article) =>
      ArticleService.toModel(article, false),
    );
  }

  return category;
};

const ArticleCategoryService: IArticleCategoryService = {
  create,
  getById,
  update,
  getList,
  disabled,
  toModel,
  delete: deleteAsync,
};

export default ArticleCategoryService;
