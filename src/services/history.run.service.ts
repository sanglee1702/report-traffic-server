import { Op } from 'sequelize';
import { ISearchUserChallengeReq } from '../controllers/challenge.controllers';
import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateHistoryRunModels,
  IHistoryRunModels,
} from '../models/history.run.models';

export interface IHistoryRunRes {
  id: number;
  totalRun: number;
  userChallengeId: number;
  description: string;
  type: string;
  createdAt: string | Date;
  unopenedGift: number[];
}

export interface IHistoryRunService {
  create: (
    models: ICreateHistoryRunModels,
  ) => Promise<IHistoryRunModels | null>;
  getByUserChallengeId: (
    userChallengeId: number,
    searchParams?: ISearchUserChallengeReq,
  ) => Promise<IHistoryRunModels[]>;
  getByUserId: (userId: number) => Promise<IHistoryRunModels[]>;
  update: (id: number, models: ICreateHistoryRunModels) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  toModel: (item: IHistoryRunModels, unopenedGift: number[]) => IHistoryRunRes;
  getTotalRunValue: (
    userChallengeId: number,
    date: ISearchUserChallengeReq,
  ) => Promise<number>;
}

const _historyRunContext = dbContext.HistoryRunContext;

const create = async (
  models: ICreateHistoryRunModels,
): Promise<IHistoryRunModels> => {
  const res = await _historyRunContext
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

const getByUserChallengeId = async (
  userChallengeId: number,
  searchParams?: ISearchUserChallengeReq,
): Promise<IHistoryRunModels[]> => {
  let options: any = {
    where: {
      userChallengeId,
      objectStatus: ObjectStatus.Active,
    },
  };
  if (searchParams) {
    options.where = {
      ...options.where,
      createdAt: {
        [Op.between]: [searchParams.startDate, searchParams.endDate],
      },
    };
  }

  const res = await _historyRunContext.findAll(options).catch((err) => {
    logger.error(err);
  });

  if (res) return res.map((item) => item.get());

  return [];
};
const getByUserId = async (userId: number): Promise<IHistoryRunModels[]> => {
  const res = await _historyRunContext
    .findAll({
      where: { userId, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((item) => item.get());

  return [];
};

const update = async (
  id: number,
  models: ICreateHistoryRunModels,
): Promise<boolean> => {
  const res = await _historyRunContext
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
  const res = await _historyRunContext
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

const getTotalRunValue = async (
  userChallengeId: number,
  date: ISearchUserChallengeReq,
): Promise<number> => {
  const res = await _historyRunContext
    .findAll({
      where: {
        userChallengeId,
        objectStatus: ObjectStatus.Active,
        createdAt: {
          [Op.between]: [new Date(date.startDate), new Date(date.endDate)],
        },
      },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res && res.length) {
    return res
      .map((item) => item.get())
      .map((item) => item.totalRun)
      .reduce((pre, next) => pre + next);
  } else {
    return 0;
  }
};

const toModel = (
  item: IHistoryRunModels,
  unopenedGift: number[],
): IHistoryRunRes => {
  return {
    id: item.id,
    description: item.description,
    totalRun: item.totalRun,
    userChallengeId: item.userChallengeId,
    type: item.type,
    createdAt: item.createdAt,
    unopenedGift: unopenedGift,
  };
};

const HistoryRunService: IHistoryRunService = {
  create,
  getByUserChallengeId,
  getByUserId,
  update,
  disabled,
  toModel,
  getTotalRunValue,
};

export default HistoryRunService;
