import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import { ICreateGroupsModels, IGroupsModels } from '../models/groups.models';

export interface IGroupService {
  create: (models: ICreateGroupsModels) => Promise<IGroupsModels | null>;
  getById: (id: number) => Promise<IGroupsModels>;
  update: (id: number, models: ICreateGroupsModels) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  getByChallengesId: (challengesId: number) => Promise<IGroupsModels>;
}

const _groupsContext = dbContext.GroupsContext;

const create = async (models: ICreateGroupsModels): Promise<IGroupsModels> => {
  const res = await _groupsContext
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
const getById = async (id: number): Promise<IGroupsModels | null> => {
  const res = await _groupsContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getByChallengesId = async (
  challengesId: number,
): Promise<IGroupsModels | null> => {
  const res = await _groupsContext
    .findOne({
      where: { challengesId },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const update = async (
  id: number,
  models: ICreateGroupsModels,
): Promise<boolean> => {
  const res = await _groupsContext
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
  const res = await _groupsContext
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

const GroupService: IGroupService = {
  create,
  getById,
  update,
  disabled,
  getByChallengesId,
};

export default GroupService;
