import { Op } from 'sequelize';
import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ChallengeStatus,
  ICreateUserChallengeModels,
  IUserChallengeModels,
} from '../models/user.challenge.models';

export interface IUserChallengenService {
  create: (
    models: ICreateUserChallengeModels,
  ) => Promise<IUserChallengeModels | null>;
  getById: (id: number) => Promise<IUserChallengeModels | null>;
  getByUserId: (userId: number) => Promise<IUserChallengeModels[]>;
  getCurrent: (userId: number) => Promise<IUserChallengeModels | null>;
  getByChallengeId: (challengesId: number) => Promise<IUserChallengeModels[]>;
  getByGroupId: (groupId: number) => Promise<IUserChallengeModels[]>;
  updateSteps: (id: number, stepsRunning: number) => Promise<boolean>;
  updateIsPaid: (id: number, isPaid: boolean) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  update: (id: number, params: ICreateUserChallengeModels) => Promise<boolean>;
  getByOrderId: (orderId: string) => Promise<IUserChallengeModels | null>;
  getListExpireDate: () => Promise<IUserChallengeModels[]>;
}

const _userChallengensContext = dbContext.UserChallengensContext;

const create = async (
  models: ICreateUserChallengeModels,
): Promise<IUserChallengeModels> => {
  const res = await _userChallengensContext
    .create({
      ...models,
      objectStatus: ObjectStatus.Active,
    })
    .catch((err) => {
      logger.error({ data: models, errors: err });
    });

  if (res) {
    return res.get();
  }

  return null;
};
const getById = async (id: number): Promise<IUserChallengeModels | null> => {
  const res = await _userChallengensContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getCurrent = async (
  userId: number,
): Promise<IUserChallengeModels | null> => {
  const res = await _userChallengensContext
    .findOne({
      where: { userId, isCurrentChallenge: true },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getByUserId = async (userId: number): Promise<IUserChallengeModels[]> => {
  const res = await _userChallengensContext
    .findAll({
      where: { userId, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((a) => a.get());

  return [];
};
const getByChallengeId = async (
  challengesId: number,
): Promise<IUserChallengeModels[]> => {
  const res = await _userChallengensContext
    .findAll({
      where: { challengesId, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((a) => a.get());

  return [];
};
const getByGroupId = async (
  groupId: number,
): Promise<IUserChallengeModels[]> => {
  const res = await _userChallengensContext
    .findAll({
      where: { groupId, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((a) => a.get());

  return [];
};
const updateSteps = async (id: number, totalRun: number): Promise<boolean> => {
  const res = await _userChallengensContext
    .update(
      { totalRun },
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
const updateIsPaid = async (id: number, isPaid: boolean): Promise<boolean> => {
  const res = await _userChallengensContext
    .update(
      { isPaid },
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
  const res = await _userChallengensContext
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
  const res = await _userChallengensContext
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
const getByOrderId = async (
  orderId: string,
): Promise<IUserChallengeModels | null> => {
  const res = await _userChallengensContext
    .findOne({
      where: { orderId },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getListExpireDate = async (): Promise<IUserChallengeModels[]> => {
  const thisDate = new Date();

  const res = await _userChallengensContext
    .findAll({
      where: {
        status: ChallengeStatus.CreateNew,
        endDate: { [Op.gte]: thisDate },
      },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((item) => item.get());

  return [];
};

const update = async (
  id: number,
  params: ICreateUserChallengeModels,
): Promise<boolean> => {
  const res = await _userChallengensContext
    .update(
      { ...params },
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

const UserChallengenService: IUserChallengenService = {
  create,
  getByUserId,
  disabled,
  getCurrent,
  updateSteps,
  getByChallengeId,
  getById,
  getByGroupId,
  updateIsPaid,
  update,
  delete: deleteAsync,
  getByOrderId,
  getListExpireDate,
};

export default UserChallengenService;
