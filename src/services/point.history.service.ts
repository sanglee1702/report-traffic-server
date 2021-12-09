import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import {
  IPointsHistoriesModels,
  ICreatePointsHistoriesModels,
} from '../models/points.history.models';

export interface IPointHistoryService {
  create: (
    models: ICreatePointsHistoriesModels,
  ) => Promise<IPointsHistoriesModels | null>;
  getByDeliveryId: (deliveryId: number) => Promise<IPointsHistoriesModels[]>;
}

const _pointHistoriesContext = dbContext.PointHistoriesContext;

const create = async (
  models: ICreatePointsHistoriesModels,
): Promise<IPointsHistoriesModels> => {
  const res = await _pointHistoriesContext
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
): Promise<IPointsHistoriesModels[]> => {
  const res = await _pointHistoriesContext
    .findAll({
      where: { deliveryId: deliveryId, objectStatus: ObjectStatus.Active },
      raw: true,
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return res.map((a) => a.get());
  }

  return [];
};

const PointHistoryService: IPointHistoryService = {
  create,
  getByDeliveryId,
};

export default PointHistoryService;
