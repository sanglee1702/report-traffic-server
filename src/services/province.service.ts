import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateProvinceModels,
  IProvinceModels,
} from '../models/province.models';

export interface IProvinceRes {
  id: number;
  name: string;
  code: string;
  level: string;
}

export interface IProvinceService {
  create: (models: ICreateProvinceModels) => Promise<IProvinceRes | null>;
  getById: (id: number) => Promise<IProvinceRes | null>;
  getByCode: (code: string) => Promise<IProvinceRes | null>;
  getList: () => Promise<IProvinceRes[]>;
  update: (id: number, models: ICreateProvinceModels) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  toModel: (item: IProvinceModels) => IProvinceRes;
}

const _provinceContext = dbContext.ProvinceContext;

const create = async (models: ICreateProvinceModels): Promise<IProvinceRes> => {
  const res = await _provinceContext
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

const getList = async (): Promise<IProvinceRes[]> => {
  const res = await _provinceContext
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

const getById = async (id: number): Promise<IProvinceRes | null> => {
  const res = await _provinceContext
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
const getByCode = async (code: string): Promise<IProvinceRes | null> => {
  const res = await _provinceContext
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

const update = async (
  id: number,
  models: ICreateProvinceModels,
): Promise<boolean> => {
  const res = await _provinceContext
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
  const res = await _provinceContext
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

const toModel = (item: IProvinceModels): IProvinceRes => {
  return {
    id: item.id,
    code: item.code,
    level: item.level,
    name: item.name,
  };
};

const ProvinceService: IProvinceService = {
  create,
  getList,
  update,
  toModel,
  delete: deleteAsync,
  getById,
  getByCode,
};

export default ProvinceService;
