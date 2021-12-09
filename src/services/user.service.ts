import { Op } from "sequelize";
import { MAX_PAGE_SIZE } from "../config";
import { IUserRes } from "../controllers/auth.controllers";
import logger from "../logs/logger";
import dbContext from "../models";
import { BasePagingReq, BasePagingRes } from "../models/common/models.type";
import { ObjectStatus, Roles } from "../models/common/models.enum";
import { ICreateUserModels, IUserModels } from "../models/users.models";
import { getOrderQuery } from "./helpers";

export interface IUserService {
  create: (models: ICreateUserModels) => Promise<IUserModels | null>;
  getById: (id: number) => Promise<IUserModels | null>;
  getByAccountId: (accountId: number) => Promise<IUserModels | null>;
  getByPhoneNumber: (phoneNumber: string) => Promise<IUserModels | null>;
  getByEmail: (email: string) => Promise<IUserModels | null>;
  update: (id: number, user: ICreateUserModels) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  toModel: (user: IUserModels) => IUserRes;
  getList: (
    params: BasePagingReq & { role: Roles[] }
  ) => Promise<BasePagingRes<IUserModels> | null>;
}

const _usersContext = dbContext.UsersContext;

const create = async (models: ICreateUserModels): Promise<IUserModels> => {
  const res = await _usersContext
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

const getById = async (id: number): Promise<IUserModels | null> => {
  const res = await _usersContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getByAccountId = async (
  accountId: number
): Promise<IUserModels | null> => {
  const res = await _usersContext
    .findOne({
      where: { accountId },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getByPhoneNumber = async (
  phoneNumber: string
): Promise<IUserModels | null> => {
  const res = await _usersContext
    .findOne({
      where: { phoneNumber },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getByEmail = async (email: string): Promise<IUserModels | null> => {
  const res = await _usersContext
    .findOne({
      where: { email },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const update = async (
  id: number,
  user: ICreateUserModels
): Promise<boolean> => {
  const res = await _usersContext
    .update(
      { ...user },
      {
        where: { id },
      }
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
  const res = await _usersContext
    .update(
      { objectStatus: ObjectStatus.DeActive, updatedBy: userId.toString() },
      {
        where: { id },
      }
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
const getList = async (
  params: BasePagingReq & { role: Roles[] }
): Promise<BasePagingRes<IUserModels> | null> => {
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize)
    ? Number(params.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(params.pageSize)
    : 10;

  let option: any = {
    where: {},
    order: getOrderQuery(params.sortNames, params.sortDirections),
  };

  if (params.status) {
    option.where.objectStatus = params.status;
  }
  if (params.role) {
    option.where.role = params.role;
  }
  if (params.keyword)
    option.where.name = {
      [Op.like]: `%${params.keyword}%`,
    };

  if (!params.allItems) {
    option.limit = pageSize;
    option.offset = (page - 1) * pageSize;
  }

  const res = await _usersContext.findAndCountAll(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    const users = res.rows.map((item) => item.get());
    return {
      items: users,
      total: res.count,
      page: page,
      pageSize: pageSize,
    };
  }

  return {
    items: [],
    total: 0,
    page: page,
    pageSize: pageSize,
  };
};

const toModel = (user: IUserModels): IUserRes => {
  return {
    id: user.id,
    accountId: user.accountId,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    address: user.address ?? null,
    dateOfBirth: user.dateOfBirth ?? null,
    email: user.email ?? null,
    phoneNumber: user.phoneNumber ?? null,
    avatarUrl: user.avatarUrl ?? null,
    companyId: user.companyId ?? null,
    height: user.height ?? null,
    weight: user.weight ?? null,
  };
};

const UserService: IUserService = {
  create,
  getById,
  getByAccountId,
  getByPhoneNumber,
  getByEmail,
  update,
  disabled,
  toModel,
  getList,
};

export default UserService;
