import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import { IArticleModels, ICreateArticleModels } from '../models/article.models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import { getOrderQuery } from './helpers';

export interface IArticleRes {
  id: number;
  title: string;
  description: string;
  content: string;
  code: string;
  banner: string;
  tag: string[];
  categoryId: number;
  isLike: boolean;
  status: ObjectStatus;
  createdAt: string;
  updatedAt: string;
  categoryName: string;
}

export interface IGetArticleReq extends BasePagingReq {
  keyword: string;
  categoryId: number;
  userId?: number;
}

export interface IArticleService {
  create: (models: ICreateArticleModels) => Promise<IArticleModels | null>;
  update: (id: number, models: ICreateArticleModels) => Promise<boolean>;
  getById: (id: number, userId?: number) => Promise<IArticleModels | null>;
  getByIds: (ids: number[], userId?: number) => Promise<IArticleRes[]>;
  getList: (
    params: IGetArticleReq,
  ) => Promise<BasePagingRes<IArticleModels> | null>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  toModel: (item: IArticleModels, isLike: boolean) => IArticleRes;
  //remove: (id: number) => Promise<boolean>;
}

const _articleContextContext = dbContext.ArticleContext;

const create = async (
  models: ICreateArticleModels,
): Promise<IArticleModels> => {
  const res = await _articleContextContext
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

const update = async (
  id: number,
  models: ICreateArticleModels,
): Promise<boolean> => {
  const res = await _articleContextContext
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

const getById = async (
  id: number,
  userId?: number,
): Promise<IArticleModels | null> => {
  const option: any = {
    where: {
      id: id,
    },
  };

  if (userId) {
    option.include = [
      {
        model: dbContext.ArticleWishlistContext,
        required: false,
        where: {
          objectStatus: ObjectStatus.Active,
          userId: userId,
        },
      },
    ];
  }

  const res = await _articleContextContext.findOne(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    return res.get();
  }

  return null;
};

const getByIds = async (
  ids: number[],
  userId?: number,
): Promise<IArticleRes[]> => {
  const option: any = {
    where: {
      id: { [Op.in]: ids },
      objectStatus: ObjectStatus.Active,
    },
    order: getOrderQuery(),
  };

  if (userId) {
    option.include = [
      {
        model: dbContext.ArticleWishlistContext,
        required: false,
        where: {
          objectStatus: ObjectStatus.Active,
          userId: userId,
        },
      },
    ];
  }

  const res = await _articleContextContext.findAll(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    return res.map((item) => {
      return toModel(item.get(), (item as any).ArticleWishlist ? true : false);
    });
  }

  return [];
};

const getList = async (
  params: IGetArticleReq,
): Promise<BasePagingRes<IArticleModels> | null> => {
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
        model: dbContext.ArticleCategoryContext,
        required: false,
      },
    ],
  };

  if (params.status) option.where.objectStatus = params.status;

  if (params.userId) {
    option.include.push({
      model: dbContext.ArticleWishlistContext,
      required: false,
      where: { objectStatus: ObjectStatus.Active, userId: params.userId },
    });
  }

  if (params.categoryId) option.where.categoryId = Number(params.categoryId);
  if (params.keyword)
    option.where.title = {
      [Op.like]: `%${params.keyword}%`,
    };

  option.offset = (page - 1) * pageSize;
  option.limit = pageSize;

  const res = await _articleContextContext
    .findAndCountAll(option)
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return {
      items: res.rows.map((a) => a.get()),
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

const disabled = async (id: number, userId: number): Promise<boolean> => {
  const res = await _articleContextContext
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
  const res = await _articleContextContext
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

const toModel = (article: IArticleModels, isLike: boolean): IArticleRes => {
  return {
    id: article.id,
    title: article.title,
    description: article.description,
    content: article.content,
    code: article.code,
    banner: article.banner,
    tag: article.tag ? article.tag.split(',') : [],
    categoryId: article.categoryId,
    isLike: isLike,
    status: article.objectStatus,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    categoryName: (article as any)?.ArticleCategory?.name || null,
  };
};

const ArticleService: IArticleService = {
  create,
  getById,
  update,
  getList,
  disabled,
  toModel,
  getByIds,
  delete: deleteAsync,
};

export default ArticleService;
