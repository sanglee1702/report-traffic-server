import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import {
  IChallengesModels,
  ICreateChallengesModels,
} from '../models/challenges.models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import { getOrderQuery } from './helpers';

export interface IChallengesRes {
  id: number;
  totalDate: number;
  price: number;
  name: string;
  avatarUrl?: string;
  totalRun: number;
  minUserRun?: number;
  isGroupChallenges: boolean;
  type: string;
  giftReceivingMilestone: number[];
  status: ObjectStatus;
  createdAt: string;
  updatedAt: string;
  backgrounds: string[];
  submittedBeforeDay: number;
  discountPrice: number;
  starDateDiscount: string | Date;
  endDateDiscount: string | Date;
  totalNumberOfDiscounts: number;
}

export interface IChallengeService {
  create: (
    models: ICreateChallengesModels,
  ) => Promise<IChallengesModels | null>;
  getAll: (
    params: BasePagingReq,
  ) => Promise<BasePagingRes<IChallengesRes> | null>;
  getById: (id: number) => Promise<IChallengesModels>;
  update: (id: number, models: ICreateChallengesModels) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  toModel: (item: IChallengesModels) => IChallengesRes;
  delete: (id: number) => Promise<boolean>;
}

const _challengensContext = dbContext.ChallengensContext;

const create = async (
  models: ICreateChallengesModels,
): Promise<IChallengesModels> => {
  const res = await _challengensContext
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

const getById = async (id: number): Promise<IChallengesModels | null> => {
  const res = await _challengensContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};

const getAll = async (
  params: BasePagingReq,
): Promise<BasePagingRes<IChallengesRes> | null> => {
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

  const res = await _challengensContext.findAndCountAll(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    const productsMain = res.rows.map((item) => toModel(item.get()));
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
  models: ICreateChallengesModels,
): Promise<boolean> => {
  const res = await _challengensContext
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
  const res = await _challengensContext
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
  const res = await _challengensContext
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

const toModel = (item: IChallengesModels): IChallengesRes => {
  const giftReceivingMilestone = item.giftReceivingMilestone
    ? item.giftReceivingMilestone.split(',')
    : [];
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    totalDate: item.totalDate,
    totalRun: item.totalRun,
    type: item.type,
    avatarUrl: item.avatarUrl,
    minUserRun: item.minUserRun,
    isGroupChallenges: item.isGroupChallenges,
    giftReceivingMilestone: giftReceivingMilestone.map((item) => Number(item)),
    status: item.objectStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    backgrounds: item.backgrounds ? item.backgrounds.split(';') : [],
    submittedBeforeDay: item.submittedBeforeDay,
    discountPrice: item.discountPrice,
    endDateDiscount: item.endDateDiscount,
    starDateDiscount: item.starDateDiscount,
    totalNumberOfDiscounts: item.totalNumberOfDiscounts,
  };
};

const ChallengeService: IChallengeService = {
  create,
  getById,
  update,
  getAll,
  disabled,
  toModel,
  delete: deleteAsync,
};

export default ChallengeService;
