import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface ICompanyEmployeeModels extends ICreateCompanyEmployeeModels {
  id: number;
}

export interface ICreateCompanyEmployeeModels extends IBaseModels {
  phoneNumber: string;
  name?: string;
  email?: string;
  companyId: number;
}

function restCompanyEmployeeTable(
  database: Sequelize,
): ModelCtor<Model<ICompanyEmployeeModels, ICreateCompanyEmployeeModels>> {
  return database.define(
    TableNames.CompanyEmployees,
    {
      phoneNumber: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      companyId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      objectStatus: {
        type: DataTypes.ENUM(ObjectStatus.Active, ObjectStatus.DeActive),
      },
      createdBy: {
        type: DataTypes.STRING,
      },
      updatedBy: {
        type: DataTypes.STRING,
      },
    },
    {
      charset: 'utf8mb4',
    },
  );
}

export default restCompanyEmployeeTable;
