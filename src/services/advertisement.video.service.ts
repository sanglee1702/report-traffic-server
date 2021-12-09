import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import {
  IAdvertisementVideoModels,
  ICreateAdvertisementVideoModels,
} from '../models/advertisement.video.models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import { getOrderQuery } from './helpers';

export interface IAdvertisementVideoRes {
  id: number;
  name: string;
  description: string;
  linkVideo: string;
  directLink: string;
  videoId: string;
  status: ObjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IAdvertisementVideoService {
  create: (
    models: ICreateAdvertisementVideoModels,
  ) => Promise<IAdvertisementVideoModels | null>;
  getById: (id: number) => Promise<IAdvertisementVideoRes | null>;
  getList: (
    params: BasePagingReq,
  ) => Promise<BasePagingRes<IAdvertisementVideoRes> | null>;
  update: (
    id: number,
    models: ICreateAdvertisementVideoModels,
  ) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  toModel: (item: IAdvertisementVideoModels) => IAdvertisementVideoRes;
  delete: (id: number) => Promise<boolean>;
}

const _advertisementVideoContext = dbContext.AdvertisementVideoContext;

const create = async (
  models: ICreateAdvertisementVideoModels,
): Promise<IAdvertisementVideoModels> => {
  const res = await _advertisementVideoContext
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
const getById = async (id: number): Promise<IAdvertisementVideoRes | null> => {
  const res = await _advertisementVideoContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return toModel(res.get());

  return null;
};
const getList = async (
  params: BasePagingReq,
): Promise<BasePagingRes<IAdvertisementVideoRes> | null> => {
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

  const res = await _advertisementVideoContext
    .findAndCountAll(option)
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    const giftCategories = res.rows.map((item) => toModel(item.get()));
    return {
      items: giftCategories,
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
  models: ICreateAdvertisementVideoModels,
): Promise<boolean> => {
  const res = await _advertisementVideoContext
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
  const res = await _advertisementVideoContext
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
  const res = await _advertisementVideoContext
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

// to models
const toModel = (item: IAdvertisementVideoModels): IAdvertisementVideoRes => {
  const category: IAdvertisementVideoRes = {
    id: item.id,
    name: item.name,
    description: item.description,
    status: item.objectStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    directLink: item.directLink,
    linkVideo: item.linkVideo,
    videoId: item.videoId,
  };

  return category;
};

const AdvertisementVideoService: IAdvertisementVideoService = {
  create,
  getList,
  getById,
  update,
  disabled,
  toModel,
  delete: deleteAsync,
};

export default AdvertisementVideoService;
