import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import { ICreateWardModels, IWardModels } from '../models/ward.models';

export interface IWardRes {
  id: number;
  name: string;
  code: string;
  level: string;
  districtCode: string;
}

export interface IWardService {
  create: (models: ICreateWardModels) => Promise<IWardRes | null>;
  getList: () => Promise<IWardRes[]>;
  getByDistrictCode: (districtCode: string) => Promise<IWardRes[]>;
  update: (id: number, models: ICreateWardModels) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  toModel: (item: IWardModels) => IWardRes;
  getById: (id: number) => Promise<IWardRes | null>;
  getByCode: (code: string) => Promise<IWardRes | null>;
}

const _wardContext = dbContext.WardContext;

const create = async (models: ICreateWardModels): Promise<IWardRes> => {
  const res = await _wardContext
    .create({
      ...models,
      objectStatus: ObjectStatus.Active,
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return toModel(res.get());
  }

  return null;
};

const getList = async (): Promise<IWardRes[]> => {
  const res = await _wardContext
    .findAll({
      where: { objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return res.map((item) => toModel(item.get()));
  }

  return [];
};

const getById = async (id: number): Promise<IWardRes | null> => {
  const res = await _wardContext
    .findOne({
      where: { id: id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return toModel(res.get());
  }

  return null;
};
const getByCode = async (code: string): Promise<IWardRes | null> => {
  const res = await _wardContext
    .findOne({
      where: { code },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return toModel(res.get());
  }

  return null;
};

const getByDistrictCode = async (districtCode: string): Promise<IWardRes[]> => {
  const res = await _wardContext
    .findAll({
      where: { objectStatus: ObjectStatus.Active, districtCode },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return res.map((item) => toModel(item.get()));
  }

  return [];
};

const update = async (
  id: number,
  models: ICreateWardModels,
): Promise<boolean> => {
  const res = await _wardContext
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

const deleteAsync = async (id: number): Promise<boolean> => {
  const res = await _wardContext
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

const toModel = (item: IWardModels): IWardRes => {
  return {
    id: item.id,
    code: item.code,
    level: item.level,
    name: item.name,
    districtCode: item.districtCode,
  };
};

const WardService: IWardService = {
  create,
  getList,
  getByDistrictCode,
  update,
  toModel,
  delete: deleteAsync,
  getById,
  getByCode,
};

export default WardService;
