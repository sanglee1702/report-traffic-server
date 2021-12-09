import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateGiftOpeningHistoryModels,
  IGiftOpeningHistoryModels,
} from '../models/gift.opening.history.models';

export interface IGiftOpeningHistoryService {
  create: (
    models: ICreateGiftOpeningHistoryModels,
  ) => Promise<IGiftOpeningHistoryModels | null>;
}

const _giftBoxHistoryContext = dbContext.GiftOpeningHistoryContext;

const create = async (
  models: ICreateGiftOpeningHistoryModels,
): Promise<IGiftOpeningHistoryModels | null> => {
  const res = await _giftBoxHistoryContext
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

const GiftOpeningHistoryService: IGiftOpeningHistoryService = {
  create,
};

export default GiftOpeningHistoryService;
