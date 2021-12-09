import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateDeliveryAddressModels,
  IDeliveryAddressModels,
} from '../models/delivery.address.models';

export interface IDeliveryAddressRes {
  id: number;
  address: string;
  phoneNumber: string;
  email: string;
  userId: number;
  fullName: string;
  isDefault: boolean;
  provinceCode: string;
  districtCode: string;
  wardsCode: string;
  provinceName: string;
  districtName: string;
  wardName: string;
}

export interface IDeliveryAddressService {
  create: (
    models: ICreateDeliveryAddressModels,
  ) => Promise<IDeliveryAddressModels | null>;
  getByUserId: (userId: number) => Promise<IDeliveryAddressModels[]>;
  getById: (id: number) => Promise<IDeliveryAddressModels | null>;
  update: (
    id: number,
    models: ICreateDeliveryAddressModels,
  ) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  toModel: (
    item: IDeliveryAddressModels,
    moreData: {
      provinceName: string;
      districtName: string;
      wardName: string;
    },
  ) => IDeliveryAddressRes;
  getDefault: (userId: number) => Promise<IDeliveryAddressModels | null>;
}

const _deliveryAddressContext = dbContext.DeliveryAddressContext;

const create = async (
  models: ICreateDeliveryAddressModels,
): Promise<IDeliveryAddressModels> => {
  const res = await _deliveryAddressContext
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

const getByUserId = async (
  userId: number,
): Promise<IDeliveryAddressModels[]> => {
  const res = await _deliveryAddressContext
    .findAll({
      where: { userId, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((item) => item.get());

  return [];
};
const getById = async (id: number): Promise<IDeliveryAddressModels | null> => {
  const res = await _deliveryAddressContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};

const update = async (
  id: number,
  models: ICreateDeliveryAddressModels,
): Promise<boolean> => {
  const res = await _deliveryAddressContext
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
  const res = await _deliveryAddressContext
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
  const res = await _deliveryAddressContext
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
const getDefault = async (
  userId: number,
): Promise<IDeliveryAddressModels | null> => {
  const res = await _deliveryAddressContext
    .findOne({
      where: { userId, isDefault: true },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};

const toModel = (
  deliveryAddress: IDeliveryAddressModels,
  moreData: {
    provinceName: string;
    districtName: string;
    wardName: string;
  },
): IDeliveryAddressRes => {
  return {
    id: deliveryAddress.id,
    phoneNumber: deliveryAddress.phoneNumber,
    email: deliveryAddress.email,
    userId: deliveryAddress.userId,
    address: deliveryAddress.address,
    fullName: deliveryAddress.fullName,
    isDefault: deliveryAddress.isDefault,
    provinceCode: deliveryAddress.provinceCode,
    districtCode: deliveryAddress.districtCode,
    wardsCode: deliveryAddress.wardsCode,
    districtName: moreData.districtName,
    provinceName: moreData.provinceName,
    wardName: moreData.wardName,
  };
};

const DeliveryAddressService: IDeliveryAddressService = {
  create,
  getByUserId,
  update,
  disabled,
  toModel,
  delete: deleteAsync,
  getById,
  getDefault,
};

export default DeliveryAddressService;
