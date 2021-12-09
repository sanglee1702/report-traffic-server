import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateGroupUserModels,
  IGroupUserModels,
} from '../models/user.groups.models';

export interface IGroupUserRes {
  id: number;
  groupId: number;
  userId: number;
}

export interface IGroupUserService {
  create: (models: ICreateGroupUserModels) => Promise<IGroupUserModels | null>;
  getById: (id: number) => Promise<IGroupUserModels | null>;
  getByGroupId: (groupId: number) => Promise<IGroupUserModels[]>;
  getByUserId: (userId: number) => Promise<IGroupUserModels[]>;
  update: (id: number, models: ICreateGroupUserModels) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  toModel: (item: IGroupUserModels) => IGroupUserRes;
}

const _groupUserContext = dbContext.GroupUserContext;

const create = async (
  models: ICreateGroupUserModels,
): Promise<IGroupUserModels> => {
  const res = await _groupUserContext
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

const getById = async (id: number): Promise<IGroupUserModels | null> => {
  const res = await _groupUserContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getByGroupId = async (groupId: number): Promise<IGroupUserModels[]> => {
  const res = await _groupUserContext
    .findAll({ where: { groupId, objectStatus: ObjectStatus.Active } })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((item) => item.get());

  return [];
};
const getByUserId = async (userId: number): Promise<IGroupUserModels[]> => {
  const res = await _groupUserContext
    .findAll({ where: { userId, objectStatus: ObjectStatus.Active } })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((item) => item.get());

  return [];
};

const update = async (
  id: number,
  models: ICreateGroupUserModels,
): Promise<boolean> => {
  const res = await _groupUserContext
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
  const res = await _groupUserContext
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

const toModel = (item: IGroupUserModels): IGroupUserRes => {
  return {
    id: item.id,
    groupId: item.groupId,
    userId: item.userId,
  };
};

const GroupUserService: IGroupUserService = {
  create,
  getByGroupId,
  getByUserId,
  getById,
  update,
  disabled,
  toModel,
};

export default GroupUserService;
