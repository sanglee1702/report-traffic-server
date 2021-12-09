import { Op } from 'sequelize';
import { MAX_PAGE_SIZE } from '../config';
import logger from '../logs/logger';
import dbContext from '../models';
import { BasePagingReq, BasePagingRes } from '../models/common/models.type';
import { FileType, ObjectStatus } from '../models/common/models.enum';
import { ICreateFileModels, IFileModels } from '../models/files.models';
import { getOrderQuery } from './helpers';

export interface IFileSearchParams extends BasePagingReq {
  type: FileType;
}

export interface IFileService {
  create: (params: ICreateFileModels) => Promise<IFileModels | null>;
  createList: (params: ICreateFileModels[]) => Promise<IFileModels[] | null>;
  update: (id: number, url: string) => Promise<boolean>;
  disabled: (id: number) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  getList: (
    params: IFileSearchParams,
  ) => Promise<BasePagingRes<IFileModels> | null>;
}

const _fileContext = dbContext.FileContext;

const create = async (
  params: ICreateFileModels,
): Promise<IFileModels | null> => {
  const res = await _fileContext
    .create({ ...params, objectStatus: ObjectStatus.Active })
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return res.get();
  }

  return null;
};
const createList = async (
  params: ICreateFileModels[],
): Promise<IFileModels[] | null> => {
  const res = await _fileContext.bulkCreate(params).catch((err) => {
    logger.error(err);
  });

  if (res) {
    return res.map((item) => item.get());
  }

  return null;
};

const update = async (id: number, url: string): Promise<boolean> => {
  const res = await _fileContext
    .update(
      { url },
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

const disabled = async (id: number): Promise<boolean> => {
  const res = await _fileContext
    .update(
      { objectStatus: ObjectStatus.DeActive },
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
  const res = await _fileContext
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

const getList = async (
  params: IFileSearchParams,
): Promise<BasePagingRes<IFileModels> | null> => {
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
  if (params.type) {
    option.where.type = params.type;
  }
  if (params.keyword) {
    option.where.fileName = {
      [Op.like]: `%${params.keyword}%`,
    };
  }
  option.limit = pageSize;
  option.offset = (page - 1) * pageSize;

  const res = await _fileContext.findAndCountAll(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    const files = res.rows.map((item) => item.get());
    return {
      items: files,
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

const FileService: IFileService = {
  create,
  update,
  createList,
  disabled,
  getList,
  delete: deleteAsync,
};

export default FileService;
