import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateDeliveryProductModels,
  IDeliveryProductModels,
} from '../models/delivery.product.models';

export interface IDeliveryProductRes {
  id: number;
  deliveryId: number;
  productId: number;
  quantity: number;
  status: ObjectStatus;
  createdAt: string;
  updatedAt: string;
  size: string;
}

export interface IDeliveryProductService {
  create: (
    models: ICreateDeliveryProductModels,
  ) => Promise<IDeliveryProductModels | null>;
  getByDeliveryId: (deliveryId: number) => Promise<IDeliveryProductModels[]>;
  getByProductId: (productId: number) => Promise<IDeliveryProductModels[]>;
  update: (
    id: number,
    models: ICreateDeliveryProductModels,
  ) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  toModel: (item: IDeliveryProductModels) => IDeliveryProductRes;
  createList: (
    models: ICreateDeliveryProductModels[],
  ) => Promise<IDeliveryProductModels[] | null>;
  deleteAsync: (ids: number[]) => Promise<boolean>;
}

const _deliveryProductContext = dbContext.DeliveryProductContext;

const create = async (
  models: ICreateDeliveryProductModels,
): Promise<IDeliveryProductModels> => {
  const res = await _deliveryProductContext
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

const getByDeliveryId = async (
  deliveryId: number,
): Promise<IDeliveryProductModels[]> => {
  const res = await _deliveryProductContext
    .findAll({
      where: { deliveryId, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((item) => item.get());

  return [];
};
const getByProductId = async (
  productId: number,
): Promise<IDeliveryProductModels[]> => {
  const res = await _deliveryProductContext
    .findAll({
      where: { productId, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((item) => item.get());

  return [];
};

const update = async (
  id: number,
  models: ICreateDeliveryProductModels,
): Promise<boolean> => {
  const res = await _deliveryProductContext
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
  const res = await _deliveryProductContext
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

const deleteAsync = async (ids: number[]): Promise<boolean> => {
  const res = await _deliveryProductContext
    .destroy({
      where: { id: ids },
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

const createList = async (
  models: ICreateDeliveryProductModels[],
): Promise<IDeliveryProductModels[] | null> => {
  const rowsDate = models.map((row) => {
    return { ...row, objectStatus: ObjectStatus.Active };
  });

  const res = await _deliveryProductContext
    .bulkCreate(rowsDate)
    .catch((err) => {
      logger.error({
        errorData: err,
        message: 'Create delivery product failed',
        data: models,
      });
    });

  if (res) {
    return res.map((row) => row.get());
  }

  return null;
};

const toModel = (item: IDeliveryProductModels): IDeliveryProductRes => {
  return {
    id: item.id,
    deliveryId: item.deliveryId,
    productId: item.productId,
    quantity: item.quantity,
    size: item.size,
    status: item.objectStatus,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const DeliveryProductService: IDeliveryProductService = {
  create,
  getByDeliveryId,
  getByProductId,
  update,
  disabled,
  toModel,
  createList,
  deleteAsync,
};

export default DeliveryProductService;
