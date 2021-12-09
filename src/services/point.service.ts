import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import { IPointsModels, ICreatePointsModels } from '../models/points.models';

export interface IPointsRes {
  id: number;
  point: number;
  price: number;
  userId: number;
}

export interface IPointService {
  create: (models: ICreatePointsModels) => Promise<IPointsModels | null>;
  getByUserId: (userId: number) => Promise<IPointsModels>;
  update: (userId: number, models: ICreatePointsModels) => Promise<boolean>;
  toModel: (item: IPointsModels) => IPointsRes;
}

const _pointContext = dbContext.PointContext;

const create = async (models: ICreatePointsModels): Promise<IPointsModels> => {
  const res = await _pointContext
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

const getByUserId = async (userId: number): Promise<IPointsModels> => {
  const res = await _pointContext
    .findOne({
      where: { userId },
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
  userId: number,
  models: ICreatePointsModels,
): Promise<boolean> => {
  const res = await _pointContext
    .update(
      { ...models },
      {
        where: { userId },
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

const toModel = (item: IPointsModels): IPointsRes => {
  return {
    id: item.id,
    point: item.point,
    price: item.price,
    userId: item.userId,
  };
};

const PointService: IPointService = {
  create,
  getByUserId,
  update,
  toModel,
};

export default PointService;
