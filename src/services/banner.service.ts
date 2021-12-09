import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import { IBannerModels, ICreateBannerModels } from '../models/banner.models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import { getOrderQuery } from './helpers';

export interface IBannerRes {
  id: number;
  url: string;
  position: number;
  status: ObjectStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBannerService {
  create: (models: ICreateBannerModels) => Promise<IBannerModels | null>;
  update: (id: number, models: ICreateBannerModels) => Promise<boolean>;
  getById: (id: number) => Promise<IBannerModels | null>;
  getList: (params: BasePagingReq) => Promise<BasePagingRes<IBannerRes> | null>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  toModel: (item: IBannerModels) => IBannerRes;
  delete: (id: number) => Promise<boolean>;
}

const _bannerContextContext = dbContext.BannerContext;

const create = async (models: ICreateBannerModels): Promise<IBannerModels> => {
  const res = await _bannerContextContext
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
  models: ICreateBannerModels,
): Promise<boolean> => {
  const res = await _bannerContextContext
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

const getById = async (id: number): Promise<IBannerModels | null> => {
  const res = await _bannerContextContext
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
): Promise<BasePagingRes<IBannerRes> | null> => {
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

  if (params.keyword)
    option.where.name = {
      [Op.like]: `%${params.keyword}%`,
    };

  if (!params.allItems) {
    option.limit = pageSize;
    option.offset = (page - 1) * pageSize;
  }

  const res = await _bannerContextContext
    .findAndCountAll(option)
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    const users = res.rows.map((item) => toModel(item.get()));
    return {
      items: users,
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
  const res = await _bannerContextContext
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
  const res = await _bannerContextContext
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

const toModel = (banner: IBannerModels): IBannerRes => {
  return {
    id: banner.id,
    position: banner.position,
    url: banner.url,
    status: banner.objectStatus,
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt,
    description: banner.description,
  };
};

const BannerService: IBannerService = {
  create,
  getById,
  update,
  getList,
  disabled,
  toModel,
  delete: deleteAsync,
};

export default BannerService;
