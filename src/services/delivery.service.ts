import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import {
  ObjectStatus,
  PaidType,
  ShippingStatus,
} from '../models/common/models.enum';
import {
  ICreateDeliveryModels,
  IDeliveryModels,
} from '../models/delivery.models';
import { IDeliveryProductModels } from '../models/delivery.product.models';
import DeliveryProductService, {
  IDeliveryProductRes,
} from './delivery.product.service';
import { getOrderQuery } from './helpers';

export interface IDeliveryRes {
  id: number;
  userId: number;
  deliveryAddress: string;
  phoneNumber: string;
  description: string;
  shippingStatus: string;
  email: string;
  products: IDeliveryProductRes[];
  status: ObjectStatus;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  paidType: PaidType;
  orderId: string;
  provinceCode: string;
  districtCode: string;
  wardsCode: string;
  totalPay?: number;
  discount?: number;
  fee?: number;
  total: number;
}

export interface IDeliverySearchParam extends BasePagingReq {
  userId?: number;
  deliveryAddress?: string;
  phoneNumber?: string;
  shippingStatus?: ShippingStatus;
  email?: string;
  paidType: PaidType;
  orderId?: string;
  provinceCode: string;
  districtCode: string;
  wardsCode: string;
}

export interface IDeliveryService {
  create: (models: ICreateDeliveryModels) => Promise<IDeliveryModels | null>;
  getBySearchParams: (
    searchParams: IDeliverySearchParam,
  ) => Promise<BasePagingRes<IDeliveryRes | null>>;
  update: (id: number, models: ICreateDeliveryModels) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  toModel: (
    item: IDeliveryModels,
    products: IDeliveryProductRes[],
  ) => IDeliveryRes;
  getByOrderId: (orderId: string) => Promise<IDeliveryRes | null>;
  getById: (id: number) => Promise<IDeliveryRes | null>;
  getByUser: (
    searchParams: IDeliverySearchParam,
  ) => Promise<BasePagingRes<IDeliveryRes>>;
}

const _deliveryContext = dbContext.DeliveryContext;

const create = async (
  models: ICreateDeliveryModels,
): Promise<IDeliveryModels> => {
  const res = await _deliveryContext
    .create({
      ...models,
      objectStatus: ObjectStatus.Active,
    })
    .catch((err) => {
      logger.error({
        errorData: err,
        message: 'Create delivery failed',
        data: models,
      });
    });

  if (res) {
    return res.get();
  }

  return null;
};

const getBySearchParams = async (
  searchParams: IDeliverySearchParam,
): Promise<BasePagingRes<IDeliveryRes | null>> => {
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize)
    ? Number(searchParams.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(searchParams.pageSize)
    : 10;

  let option: any = {
    where: {},
    order: getOrderQuery(searchParams.sortNames, searchParams.sortDirections),
    include: [
      {
        model: dbContext.DeliveryProductContext,
        required: false,
        where: { objectStatus: ObjectStatus.Active },
      },
    ],
  };

  option.limit = pageSize;
  option.offset = (page - 1) * pageSize;

  if (searchParams.userId) option.where.userId = Number(searchParams.userId);

  if (searchParams.keyword)
    option.where.fullName = {
      [Op.like]: `%${searchParams.keyword}%`,
    };
  if (searchParams.deliveryAddress)
    option.where.deliveryAddress = {
      [Op.like]: `%${searchParams.deliveryAddress}%`,
    };
  if (searchParams.districtCode)
    option.where.districtCode = searchParams.districtCode;
  if (searchParams.email)
    option.where.email = {
      [Op.like]: `%${searchParams.email}%`,
    };
  if (searchParams.orderId) option.where.orderId = searchParams.orderId;
  if (searchParams.paidType) option.where.paidType = searchParams.paidType;
  if (searchParams.phoneNumber)
    option.where.phoneNumber = searchParams.phoneNumber;
  if (searchParams.provinceCode)
    option.where.provinceCode = searchParams.provinceCode;
  if (searchParams.shippingStatus)
    option.where.shippingStatus = searchParams.shippingStatus;
  if (searchParams.wardsCode) option.where.wardsCode = searchParams.wardsCode;
  if (searchParams.status) option.where.objectStatus = searchParams.status;

  const res = await _deliveryContext.findAndCountAll(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    const payments = res.rows.map((item) => item.get());

    return {
      items: payments.map((item) =>
        toModel(item, (item as any).DeliveryProducts),
      ),
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
  models: ICreateDeliveryModels,
): Promise<boolean> => {
  const res = await _deliveryContext
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
  const res = await _deliveryContext
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
  const res = await _deliveryContext
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
const getByOrderId = async (orderId: string): Promise<IDeliveryRes | null> => {
  let option: any = {
    where: { orderId },
    include: [
      {
        model: dbContext.DeliveryProductContext,
        required: false,
        where: { objectStatus: ObjectStatus.Active },
      },
    ],
  };

  const res = await _deliveryContext.findOne(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    const delivery = res.get();

    return toModel(delivery, (delivery as any).DeliveryProducts);
  }

  return null;
};
const getById = async (id: number): Promise<IDeliveryRes | null> => {
  let option: any = {
    where: { id },
    include: [
      {
        model: dbContext.DeliveryProductContext,
        required: false,
        where: { objectStatus: ObjectStatus.Active },
      },
    ],
  };

  const res = await _deliveryContext.findOne(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    const delivery = res.get();

    return toModel(delivery, (delivery as any).DeliveryProducts);
  }

  return null;
};

const getByUser = async (
  searchParams: IDeliverySearchParam,
): Promise<BasePagingRes<IDeliveryRes>> => {
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize)
    ? Number(searchParams.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(searchParams.pageSize)
    : 10;

  let option: any = {
    where: {
      shippingStatus: {
        [Op.not]: ShippingStatus.Create,
      },
      userId: Number(searchParams.userId),
    },
    order: getOrderQuery(searchParams.sortNames, searchParams.sortDirections),
    include: [
      {
        model: dbContext.DeliveryProductContext,
        required: false,
        where: { objectStatus: ObjectStatus.Active },
      },
    ],
  };

  option.limit = pageSize;
  option.offset = (page - 1) * pageSize;

  const res = await _deliveryContext.findAndCountAll(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    const payments = res.rows.map((item) => item.get());

    return {
      items: payments.map((item) =>
        toModel(item, (item as any).DeliveryProducts),
      ),
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

const toModel = (
  item: IDeliveryModels,
  products: IDeliveryProductModels[],
): IDeliveryRes => {
  return {
    id: item.id,
    phoneNumber: item.phoneNumber,
    email: item.email,
    userId: item.userId,
    deliveryAddress: item.deliveryAddress,
    shippingStatus: item.shippingStatus,
    description: item.description,
    totalPay: item.totalPay,
    products:
      products && products.length
        ? products.map((item) => DeliveryProductService.toModel(item))
        : [],
    status: item.objectStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    fullName: item.fullName,
    districtCode: item.districtCode,
    orderId: item.orderId,
    paidType: item.paidType,
    provinceCode: item.provinceCode,
    wardsCode: item.wardsCode,
    discount: item.discount,
    fee: item.fee,
    total: item.total,
  };
};

const DeliveryService: IDeliveryService = {
  create,
  getBySearchParams,
  update,
  disabled,
  delete: deleteAsync,
  toModel,
  getByOrderId,
  getById,
  getByUser,
};

export default DeliveryService;
