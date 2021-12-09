import { Op, Sequelize } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import {
  IAccountModels,
  ICreateAccountModels,
} from '../models/accounts.models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus, Roles } from '../models/common/models.enum';
import { IUserModels } from '../models/users.models';
import { getOrderQuery } from './helpers';

export interface IAccountAdminModels extends IUserModels {
  username: string;
  role: Roles;
}

export interface IUserSearchParams extends BasePagingReq {
  roles?: Roles[];
  id?: number;
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface IAccountService {
  create: (models: ICreateAccountModels) => Promise<IAccountModels | null>;
  updateToken: (
    username: string,
    token: string,
    hasExpired: boolean,
  ) => Promise<boolean>;
  getById: (id: number) => Promise<IAccountModels | null>;
  getByUserName: (username: string) => Promise<IAccountModels | null>;
  disabled: (username: string) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  toModel: (accountModel: IAccountModels) => IAccountResModels;
  remove: (username: string) => Promise<boolean>;
  login: (username: string, password: string) => Promise<IAccountModels | null>;
  update: (id: number, models: ICreateAccountModels) => Promise<boolean>;
  getList: (
    params: IUserSearchParams,
    skipIds: number[],
  ) => Promise<BasePagingRes<IAccountAdminModels>>;
  updatePassword: (
    id: number,
    newPassword: string,
    updatedBy: number,
  ) => Promise<boolean>;
  getListAccountReport: (
    params: IUserSearchParams,
  ) => Promise<BasePagingRes<IAccountAdminModels>>;
  getByReferralCode: (referralCode: string) => Promise<IAccountModels | null>;
  updateFCMToken: (id: number, fcmToken: string) => Promise<boolean>;
}

export interface IAccountResModels {
  id: number;
  username: string;
  token: string;
  hasExpired: boolean;
}

const _accountsContext = dbContext.AccountsContext;

const create = async (
  models: ICreateAccountModels,
): Promise<IAccountModels> => {
  const res = await _accountsContext
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
const update = async (
  id: number,
  models: ICreateAccountModels,
): Promise<boolean> => {
  const res = await _accountsContext
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
const updateToken = async (
  username: string,
  token: string,
  hasExpired: boolean,
): Promise<boolean> => {
  const res = await _accountsContext
    .update(
      { token, hasExpired },
      {
        where: { username },
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
const getById = async (id: number): Promise<IAccountModels | null> => {
  const res = await _accountsContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getByUserName = async (
  username: string,
): Promise<IAccountModels | null> => {
  const res = await _accountsContext
    .findOne({
      where: { username },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getByReferralCode = async (
  referralCode: string,
): Promise<IAccountModels | null> => {
  const res = await _accountsContext
    .findOne({
      where: { referralCode },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const disabled = async (username: string): Promise<boolean> => {
  const res = await _accountsContext
    .update(
      { objectStatus: ObjectStatus.DeActive },
      {
        where: { username },
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
const remove = async (username: string): Promise<boolean> => {
  const res = await _accountsContext
    .destroy({
      where: { username },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res && res[0] === 1) {
    return true;
  } else {
    return false;
  }
};
const login = async (
  username: string,
  password: string,
): Promise<IAccountModels | null> => {
  const res = await _accountsContext
    .findOne({
      where: { username, password },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getList = async (
  params: IUserSearchParams,
  skipIds: number[],
): Promise<BasePagingRes<IAccountAdminModels> | null> => {
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize)
    ? Number(params.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(params.pageSize)
    : 10;

  let option: any = {
    where: {
      id: {
        [Op.notIn]: skipIds,
      },
    },
    order: getOrderQuery(params.sortNames, params.sortDirections),
    include: [
      {
        model: dbContext.UsersContext,
        required: !!params.keyword,
        where: params.keyword
          ? Sequelize.where(
              Sequelize.fn(
                'concat',
                Sequelize.col('firstName'),
                ' ',
                Sequelize.col('lastName'),
                ' ',
                Sequelize.col('email'),
              ),
              {
                [Op.like]: `%${params.keyword}%`,
              },
            )
          : {},
      },
    ],
  };

  if (params.status) {
    option.where.objectStatus = params.status;
  }
  if (params.roles) {
    option.where.role = params.roles;
  }
  if (params.startDate && params.endDate) {
    option.where.createdAt = {
      [Op.between]: [params.startDate, params.endDate],
    };
  } else if (params.startDate) {
    option.where.createdAt = {
      [Op.gte]: [params.startDate],
    };
  } else if (params.endDate) {
    option.where.createdAt = {
      [Op.lte]: [params.endDate],
    };
  }

  option.limit = pageSize;
  option.offset = (page - 1) * pageSize;

  const res = await _accountsContext.findAndCountAll(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    const users = res.rows.map((item) => toAdminModel(item.get() as any));
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
const updatePassword = async (
  id: number,
  newPassword: string,
  updatedBy: number,
): Promise<boolean> => {
  const res = await _accountsContext
    .update(
      { password: newPassword, updatedBy: updatedBy.toString() },
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
  const res = await _accountsContext
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
const getListAccountReport = async (
  params: IUserSearchParams,
): Promise<BasePagingRes<IAccountAdminModels> | null> => {
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize)
    ? Number(params.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(params.pageSize)
    : 10;

  let option: any = {
    where: {},
    order: getOrderQuery(params.sortNames, params.sortDirections),
    include: [
      {
        model: dbContext.UsersContext,
        required: !!params.keyword,
        where: params.keyword
          ? Sequelize.where(
              Sequelize.fn(
                'concat',
                Sequelize.col('firstName'),
                ' ',
                Sequelize.col('lastName'),
                ' ',
                Sequelize.col('email'),
              ),
              {
                [Op.like]: `%${params.keyword}%`,
              },
            )
          : {},
      },
    ],
  };

  if (params.status) {
    option.where.objectStatus = params.status;
  }
  if (params.roles) {
    option.where.role = params.roles;
  }
  if (params.startDate && params.endDate) {
    option.where.createdAt = {
      [Op.between]: [params.startDate, params.endDate],
    };
  } else if (params.startDate) {
    option.where.createdAt = {
      [Op.gte]: params.startDate,
    };
  } else if (params.endDate) {
    option.where.createdAt = {
      [Op.lte]: params.endDate,
    };
  }

  if (!params.allItems) {
    option.limit = pageSize;
    option.offset = (page - 1) * pageSize;
  }

  const res = await _accountsContext.findAndCountAll(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    const users = res.rows.map((item) => toAdminModel(item.get() as any));
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
const updateFCMToken = async (
  id: number,
  fcmToken: string,
): Promise<boolean> => {
  const res = await _accountsContext
    .update(
      { fcmToken },
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

const toModel = (accountModel: IAccountModels): IAccountResModels => {
  return {
    id: accountModel.id,
    username: accountModel.username,
    token: accountModel.token,
    hasExpired: accountModel.hasExpired,
  };
};

const toAdminModel = (
  item: IAccountModels & { User: IUserModels },
): IAccountAdminModels => {
  return {
    id: item.User?.id || null,
    username: item.username,
    email: item.User?.email || null,
    accountId: item.id,
    address: item.User?.address || null,
    avatarUrl: item.User?.avatarUrl || null,
    companyId: item.User?.companyId || null,
    firstName: item.User?.firstName || null,
    lastName: item.User?.lastName || null,
    dateOfBirth: item.User?.dateOfBirth || null,
    height: item.User?.height || null,
    createdAt: item.createdAt || null,
    createdBy: item.createdBy || null,
    objectStatus: item.objectStatus || null,
    phoneNumber: item.User?.phoneNumber || null,
    role: item.role,
    updatedAt: item.updatedAt || null,
    updatedBy: item.updatedBy || null,
    weight: item.User?.weight || null,
  };
};

const AccountService: IAccountService = {
  create,
  updateToken,
  getById,
  getByUserName,
  disabled,
  toModel,
  remove,
  login,
  update,
  getList,
  updatePassword,
  delete: deleteAsync,
  getListAccountReport: getListAccountReport,
  getByReferralCode,
  updateFCMToken,
};

export default AccountService;
