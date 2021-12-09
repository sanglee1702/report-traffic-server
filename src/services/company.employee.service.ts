import { Op } from 'sequelize';
import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICompanyEmployeeModels,
  ICreateCompanyEmployeeModels,
} from '../models/company.employee.models';

export interface ICompanyEmployeeRes {
  id: number;
  phoneNumber: string;
  name?: string;
  email?: string;
  companyId: number;
}

export interface ICompanyEmployeeService {
  create: (
    models: ICreateCompanyEmployeeModels,
  ) => Promise<ICompanyEmployeeModels | null>;
  getByCompanyId: (companyId: number) => Promise<ICompanyEmployeeModels[]>;
  update: (
    id: number,
    models: ICreateCompanyEmployeeModels,
  ) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
  toModel: (item: ICompanyEmployeeModels) => ICompanyEmployeeRes;
}

const _companyEmployeeContext = dbContext.CompanyEmployeeContext;

const create = async (
  models: ICreateCompanyEmployeeModels,
): Promise<ICompanyEmployeeModels> => {
  const res = await _companyEmployeeContext
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

const getByCompanyId = async (
  companyId: number,
): Promise<ICompanyEmployeeModels[]> => {
  const res = await _companyEmployeeContext
    .findAll({
      where: {
        companyId,
        name: {
          [Op.like]: '',
        },
        objectStatus: ObjectStatus.Active,
      },
      limit: 10, // items
      offset: 10, // skip
      order: [
        ['id', 'DESC'],
        ['name', 'ASC'],
      ],
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.map((item) => item.get());

  return [];
};

const update = async (
  id: number,
  models: ICreateCompanyEmployeeModels,
): Promise<boolean> => {
  const res = await _companyEmployeeContext
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
  const res = await _companyEmployeeContext
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

const toModel = (
  companyEmployee: ICompanyEmployeeModels,
): ICompanyEmployeeRes => {
  return {
    id: companyEmployee.id,
    name: companyEmployee.name,
    phoneNumber: companyEmployee.phoneNumber,
    email: companyEmployee.email,
    companyId: companyEmployee.companyId,
  };
};

const CompanyEmployeeService: ICompanyEmployeeService = {
  create,
  getByCompanyId,
  update,
  disabled,
  toModel,
};

export default CompanyEmployeeService;
