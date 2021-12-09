import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import { ICompanyModels, ICreateCompanyModels } from '../models/company.models';

export interface ICompanyService {
  create: (models: ICreateCompanyModels) => Promise<ICompanyModels | null>;
  getById: (id: number) => Promise<ICompanyModels>;
  update: (id: number, models: ICreateCompanyModels) => Promise<boolean>;
  disabled: (id: number, userId: number) => Promise<boolean>;
}

const _companyContext = dbContext.CompanyContext;

const create = async (
  models: ICreateCompanyModels,
): Promise<ICompanyModels> => {
  const res = await _companyContext
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

const getById = async (id: number): Promise<ICompanyModels | null> => {
  const res = await _companyContext
    .findOne({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};

const update = async (
  id: number,
  models: ICreateCompanyModels,
): Promise<boolean> => {
  const res = await _companyContext
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
  const res = await _companyContext
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

const CompanyService: ICompanyService = {
  create,
  getById,
  update,
  disabled,
};

export default CompanyService;
