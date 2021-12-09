import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreatePaymentHistoriesModels,
  IMoreDataPayment,
  IPaymentHistoriesDetailRes,
  IPaymentHistoriesModels,
  IPaymentHistoriesRes,
} from '../models/payment.histories.models';
import { getOrderQuery } from './helpers';

export interface IPaymentHistoriesSearchParams extends BasePagingReq {
  userId: number;
  orderId: number;
  paidType: string;
  challengesId: number;
  userChallengeId: number;
  deliveryId: number;
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface IPaymentHistoryService {
  create: (
    models: ICreatePaymentHistoriesModels,
  ) => Promise<IPaymentHistoriesModels | null>;
  update: (
    id: number,
    models: ICreatePaymentHistoriesModels,
  ) => Promise<boolean>;
  getAll: () => Promise<IPaymentHistoriesModels[]>;
  getBySearchParams: (
    searchParams: IPaymentHistoriesSearchParams,
  ) => Promise<BasePagingRes<IPaymentHistoriesRes>>;
  checkHasOrderId: (orderId: string) => Promise<boolean>;
  getById: (id: number) => Promise<IPaymentHistoriesModels | null>;
  getByOrderId: (orderId: string) => Promise<IPaymentHistoriesModels | null>;
  toModel: (item: IPaymentHistoriesModels) => IPaymentHistoriesRes;
  toDetailModel: (
    item: IPaymentHistoriesModels,
    moreData: IMoreDataPayment,
  ) => IPaymentHistoriesDetailRes;
  getByReportParams: (
    searchParams: IPaymentHistoriesSearchParams,
  ) => Promise<BasePagingRes<IPaymentHistoriesModels>>;
}

const _paymentHistoriesContext = dbContext.PaymentHistoriesContext;

const create = async (
  models: ICreatePaymentHistoriesModels,
): Promise<IPaymentHistoriesModels | null> => {
  const res = await _paymentHistoriesContext
    .create({
      ...models,
      objectStatus: ObjectStatus.Active,
    })
    .catch((err) => {
      logger.error({
        message: 'Create payment history error',
        data: models,
        err,
      });
    });

  if (res) {
    return res.get();
  }

  return null;
};
const update = async (
  id: number,
  models: ICreatePaymentHistoriesModels,
): Promise<boolean> => {
  const res = await _paymentHistoriesContext
    .update(
      { ...models },
      {
        where: { id },
      },
    )
    .catch((err) => {
      logger.error({
        message: 'update payment history error',
        data: models,
        err,
      });
    });

  if (res && res[0] === 1) {
    return true;
  } else {
    return false;
  }
};
const getAll = async (): Promise<IPaymentHistoriesModels[]> => {
  const res = await _paymentHistoriesContext
    .findAll({ where: { objectStatus: ObjectStatus.Active } })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((a) => a.get());

  return [];
};
const getBySearchParams = async (
  searchParams: IPaymentHistoriesSearchParams,
): Promise<BasePagingRes<IPaymentHistoriesRes | null>> => {
  const page = searchParams.page || 1;
  const pageSize = Number(searchParams.pageSize)
    ? Number(searchParams.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(searchParams.pageSize)
    : 10;

  let option: any = {
    where: {},
    order: getOrderQuery(searchParams.sortNames, searchParams.sortDirections),
  };

  option.limit = pageSize;
  option.offset = (page - 1) * pageSize;
  if (searchParams.userId) option.where.userId = searchParams.userId;
  if (searchParams.status) option.where.objectStatus = searchParams.status;
  if (searchParams.orderId) option.where.orderId = searchParams.orderId;
  if (searchParams.paidType) option.where.paidType = searchParams.paidType;
  if (searchParams.challengesId)
    option.where.challengesId = searchParams.challengesId;
  if (searchParams.userChallengeId)
    option.where.userChallengeId = searchParams.userChallengeId;
  if (searchParams.deliveryId)
    option.where.deliveryId = searchParams.deliveryId;

  const res = await _paymentHistoriesContext
    .findAndCountAll(option)
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    const payments = res.rows.map((item) => toModel(item.get()));

    return {
      items: payments,
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
const checkHasOrderId = async (orderId: string): Promise<boolean> => {
  const res = await _paymentHistoriesContext
    .findOne({ where: { orderId, objectStatus: ObjectStatus.Active } })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return true;

  return false;
};
const getByOrderId = async (
  orderId: string,
): Promise<IPaymentHistoriesModels | null> => {
  const res = await _paymentHistoriesContext
    .findOne({ where: { orderId } })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getById = async (id: number): Promise<IPaymentHistoriesModels | null> => {
  const res = await _paymentHistoriesContext
    .findOne({ where: { id } })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getByReportParams = async (
  searchParams: IPaymentHistoriesSearchParams,
): Promise<BasePagingRes<IPaymentHistoriesModels | null>> => {
  const page = searchParams.page || 1;
  const pageSize = Number(searchParams.pageSize)
    ? Number(searchParams.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(searchParams.pageSize)
    : 10;

  let option: any = {
    where: {},
    order: getOrderQuery(searchParams.sortNames, searchParams.sortDirections),
  };

  if (!searchParams.allItems) {
    option.limit = pageSize;
    option.offset = (page - 1) * pageSize;
  }
  if (searchParams.startDate && searchParams.endDate) {
    option.where.createdAt = {
      [Op.between]: [searchParams.startDate, searchParams.endDate],
    };
  } else if (searchParams.startDate) {
    option.where.createdAt = {
      [Op.gte]: searchParams.startDate,
    };
  } else if (searchParams.endDate) {
    option.where.createdAt = {
      [Op.lte]: searchParams.endDate,
    };
  }
  if (searchParams.userId) option.where.userId = searchParams.userId;
  if (searchParams.status) option.where.objectStatus = searchParams.status;
  if (searchParams.orderId) option.where.orderId = searchParams.orderId;
  if (searchParams.paidType) option.where.paidType = searchParams.paidType;
  if (searchParams.challengesId)
    option.where.challengesId = searchParams.challengesId;
  if (searchParams.userChallengeId)
    option.where.userChallengeId = searchParams.userChallengeId;
  if (searchParams.deliveryId)
    option.where.deliveryId = searchParams.deliveryId;

  const res = await _paymentHistoriesContext
    .findAndCountAll(option)
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    const payments = res.rows.map((item) => item.get());

    return {
      items: payments,
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

const toModel = (item: IPaymentHistoriesModels): IPaymentHistoriesRes => {
  return {
    id: item.id,
    createdAt: item.createdAt,
    paidType: item.paidType,
    updatedAt: item.updatedAt,
    userId: item.userId,
    challengeId: item.challengesId,
    deliveryId: item.deliveryId,
    totalPay: item.totalPay,
    orderId: item.orderId,
    userChallengeId: item.userChallengeId,
    fee: item.fee,
    discount: item.discount,
    total: item.total,
  };
};
const toDetailModel = (
  item: IPaymentHistoriesModels,
  moreData: IMoreDataPayment,
): IPaymentHistoriesDetailRes => {
  return {
    id: item.id,
    createdAt: item.createdAt,
    paidType: item.paidType ?? null,
    updatedAt: item.updatedAt,
    userId: item.userId ?? null,
    challengeId: item.challengesId ?? null,
    deliveryId: item.deliveryId ?? null,
    orderId: item.orderId ?? null,
    totalPay: item.totalPay ?? 0,
    userChallengeId: item.userChallengeId ?? null,
    challengeName: moreData.challengeName ?? null,
    dataPayment: moreData.dataPayment ?? null,
    description: moreData.description ?? null,
    email: moreData.email ?? null,
    fullName: moreData.fullName ?? null,
    phoneNumber: moreData.phoneNumber ?? null,
    discount: item.discount ?? 0,
    fee: item.fee ?? 0,
    total: item.total ?? 0,
  };
};

const PaymentHistoryService: IPaymentHistoryService = {
  create,
  update,
  getAll,
  getBySearchParams,
  checkHasOrderId,
  getByOrderId,
  toModel,
  toDetailModel,
  getById,
  getByReportParams,
};

export default PaymentHistoryService;
