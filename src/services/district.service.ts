import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateDistrictModels,
  IDistrictModels,
} from '../models/district.models';
export interface IDistrictRes {
  id: number;
  name: string;
  code: string;
  level: string;
  provinceCode: string;
}

export interface IDistrictService {
  create: (models: ICreateDistrictModels) => Promise<IDistrictRes | null>;
  getList: () => Promise<IDistrictRes[]>;
  getByProvinceCode: (provinceCode: string) => Promise<IDistrictRes[]>;
  update: (id: number, models: ICreateDistrictModels) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  toModel: (item: IDistrictModels) => IDistrictRes;
  getById: (id: number) => Promise<IDistrictRes | null>;
  getByCode: (code: string) => Promise<IDistrictRes | null>;
}

const _districtContext = dbContext.DistrictContext;

const create = async (models: ICreateDistrictModels): Promise<IDistrictRes> => {
  const res = await _districtContext
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

const getList = async (): Promise<IDistrictRes[]> => {
  const res = await _districtContext
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

const getById = async (id: number): Promise<IDistrictRes | null> => {
  const res = await _districtContext
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

const getByCode = async (code: string): Promise<IDistrictRes | null> => {
  const res = await _districtContext
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

const getByProvinceCode = async (
  provinceCode: string,
): Promise<IDistrictRes[]> => {
  const res = await _districtContext
    .findAll({
      where: { objectStatus: ObjectStatus.Active, provinceCode },
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
  models: ICreateDistrictModels,
): Promise<boolean> => {
  const res = await _districtContext
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
  const res = await _districtContext
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

const toModel = (item: IDistrictModels): IDistrictRes => {
  return {
    id: item.id,
    code: item.code,
    level: item.level,
    name: item.name,
    provinceCode: item.provinceCode,
  };
};

const DistrictService: IDistrictService = {
  create,
  getList,
  getByProvinceCode,
  update,
  toModel,
  delete: deleteAsync,
  getById,
  getByCode,
};

export default DistrictService;
