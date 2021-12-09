import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateNotificationsModels,
  IGetNotificationsReq,
  INotificationsModels,
  INotificationsRes,
} from '../models/notifications.models';
import { getOrderQuery } from './helpers';

export interface INotificationstService {
  create: (
    models: ICreateNotificationsModels,
  ) => Promise<INotificationsRes | null>;
  update: (id: number, models: ICreateNotificationsModels) => Promise<boolean>;
  getBySearchParams: (
    params: IGetNotificationsReq,
  ) => Promise<BasePagingRes<INotificationsRes>>;
  getByUser: (
    params: BasePagingReq,
    userId?: number,
  ) => Promise<BasePagingRes<INotificationsRes>>;
  getById: (id: number) => Promise<INotificationsModels | null>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  toModel: (item: INotificationsModels, userId?: number) => INotificationsRes;
  getNumberNotificationNoRead: (userId?: number) => Promise<number>;
}

const _notificationsContext = dbContext.NotificationsContext;

const create = async (
  models: ICreateNotificationsModels,
): Promise<INotificationsRes> => {
  const res = await _notificationsContext
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
const update = async (
  id: number,
  models: ICreateNotificationsModels,
): Promise<boolean> => {
  const res = await _notificationsContext
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
const getBySearchParams = async (
  params: IGetNotificationsReq,
): Promise<BasePagingRes<INotificationsRes>> => {
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
  option.limit = pageSize;
  option.offset = (page - 1) * pageSize;

  if (params.userId) {
    option.where.userId = params.userId;
  }
  if (params.status) {
    option.where.objectStatus = params.status;
  }
  if (params.type) {
    option.where.type = params.type;
  }
  if (params.keyword)
    option.where.title = {
      [Op.like]: `%${params.keyword}%`,
    };

  const res = await _notificationsContext
    .findAndCountAll(option)
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    const notifications = res.rows.map((item) => toModel(item.get()));

    return {
      items: notifications,
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
const disabled = async (id: number, userId: number): Promise<boolean> => {
  const res = await _notificationsContext
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
  const res = await _notificationsContext
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
const getById = async (id: number): Promise<INotificationsModels | null> => {
  let options: any = {
    where: { id },
  };

  const res = await _notificationsContext.findOne(options).catch((err) => {
    logger.error(err);
  });

  if (res) {
    return res.get();
  }

  return null;
};
const getByUser = async (
  params: BasePagingReq,
  userId?: number,
): Promise<BasePagingRes<INotificationsRes>> => {
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize)
    ? Number(params.pageSize) > MAX_PAGE_SIZE
      ? MAX_PAGE_SIZE
      : Number(params.pageSize)
    : 10;

  let option: any = {
    where: {
      [Op.or]: [
        {
          userId: userId,
        },
        {
          userId: null,
        },
      ],
    },
    order: getOrderQuery(),
  };

  option.limit = pageSize;
  option.offset = (page - 1) * pageSize;
  if (params.status) {
    option.where.objectStatus = params.status;
  }
  if (params.keyword)
    option.where.title = {
      [Op.like]: `%${params.keyword}%`,
    };

  const res = await _notificationsContext
    .findAndCountAll(option)
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    let notifications = res.rows.map((item) => item.get());

    notifications = notifications.filter((item) => {
      const deletes: number[] = item.deletes
        ? item.deletes.split(',').map((i) => Number(i))
        : [];

      const isDelete = userId ? !deletes.some((id) => id === userId) : true;

      return isDelete;
    });

    return {
      items: notifications.map((item) => toModel(item, userId)),
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
const getNumberNotificationNoRead = async (
  userId?: number,
): Promise<number> => {
  let options: any = {
    where: {},
  };

  if (userId) {
    options.where = {
      [Op.or]: [
        {
          [Op.and]: {
            reads: {
              [Op.not]: `%${userId}%`,
            },
            deletes: {
              [Op.not]: `%${userId}%`,
            },
          },
        },
        {
          reads: {
            [Op.is]: null,
          },
          deletes: {
            [Op.is]: null,
          },
        },
      ],
    };
  }

  const res = await _notificationsContext.count(options).catch((err) => {
    logger.error(err);
  });

  if (res) {
    return res as any;
  }

  return 0;
};
const toModel = (
  item: INotificationsModels,
  userId?: number,
): INotificationsRes => {
  const reads: number[] = item.reads
    ? item.reads.split(',').map((i) => Number(i))
    : [];

  const isRead = userId ? reads.some((id) => id === userId) : false;

  return {
    id: item.id,
    userId: item.userId,
    title: item.title,
    description: item.description,
    type: item.type,
    thumb: item.thumb,
    imageUrl: item.imageUrl,
    moreData: item.moreData,
    status: item.objectStatus,
    updatedAt: item.updatedAt,
    createdAt: item.createdAt,
    isRead: isRead,
  };
};

const NotificationsService: INotificationstService = {
  getById,
  create,
  update,
  getBySearchParams,
  disabled,
  delete: deleteAsync,
  getByUser,
  getNumberNotificationNoRead,
  toModel,
};

export default NotificationsService;
