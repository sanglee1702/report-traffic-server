import { MAX_PAGE_SIZE } from '../config';
import { IGetWishlistReq } from '../controllers/user.controller';
import logger from '../logs/logger';
import dbContext from '../models';
import {
  IArticleCreateWishlistModels,
  IArticleWishlistModels,
} from '../models/article.wishlist.models';
import { BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import { getOrderQuery } from './helpers';

export interface IArticleWishlistRes {
  id: number;
  userId: number;
  articleId: number;
}

export interface IArticleWishlistService {
  create: (
    models: IArticleCreateWishlistModels,
  ) => Promise<IArticleWishlistModels | null>;
  getById: (id: number) => Promise<IArticleWishlistModels | null>;
  getByArticleId: (articleId: number) => Promise<IArticleWishlistModels[]>;
  getByUserId: (
    userId: number,
    params: IGetWishlistReq,
  ) => Promise<BasePagingRes<IArticleWishlistModels> | null>;
  update: (
    id: number,
    models: IArticleCreateWishlistModels,
  ) => Promise<boolean>;
  disabled: (id: number) => Promise<boolean>;
  hasLiked: (articleId: number, userId: number) => Promise<boolean>;
  toModel: (item: IArticleWishlistModels) => IArticleWishlistRes;
  getByUserAndArticleId: (
    articleId: number,
    userId: number,
  ) => Promise<IArticleWishlistModels | null>;
}

const _articleWishlistContext = dbContext.ArticleWishlistContext;

const create = async (
  models: IArticleCreateWishlistModels,
): Promise<IArticleWishlistModels> => {
  const res = await _articleWishlistContext
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

const getById = async (id: number): Promise<IArticleWishlistModels | null> => {
  const res = await _articleWishlistContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getByArticleId = async (
  articleId: number,
): Promise<IArticleWishlistModels[]> => {
  const res = await _articleWishlistContext
    .findAll({ where: { articleId, objectStatus: ObjectStatus.Active } })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((item) => item.get());

  return [];
};
const getByUserId = async (
  userId: number,
  params: IGetWishlistReq,
): Promise<BasePagingRes<IArticleWishlistModels> | null> => {
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

  const res = await _articleWishlistContext
    .findAndCountAll(option)
    .catch((err) => {
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
  articleId: number,
  userId: number,
): Promise<boolean> => {
  const res = await _articleWishlistContext
    .findOne({
      where: { userId, articleId, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return true;

  return false;
};

const getByUserAndArticleId = async (
  articleId: number,
  userId: number,
): Promise<IArticleWishlistModels | null> => {
  const res = await _articleWishlistContext
    .findOne({
      where: { userId, articleId, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};

const update = async (
  id: number,
  models: IArticleCreateWishlistModels,
): Promise<boolean> => {
  const res = await _articleWishlistContext
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
  const res = await _articleWishlistContext
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

const toModel = (item: IArticleWishlistModels): IArticleWishlistRes => {
  return {
    id: item.id,
    articleId: item.articleId,
    userId: item.userId,
  };
};

const ArticleWishlistService: IArticleWishlistService = {
  create,
  getByArticleId,
  getByUserId,
  getById,
  update,
  disabled,
  toModel,
  hasLiked,
  getByUserAndArticleId,
};

export default ArticleWishlistService;
