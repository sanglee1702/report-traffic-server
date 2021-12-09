import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface ICompanyModels extends ICreateCompanyModels {
  id: number;
}

export interface ICreateCompanyModels extends IBaseModels {
  companyName: string;
  avatarUrl?: string;
  email: string;
  phoneNumber: string;
}

function restCompanyTable(
  database: Sequelize,
): ModelCtor<Model<ICompanyModels, ICreateCompanyModels>> {
  return database.define(
    TableNames.Companies,
    {
      companyName: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      avatarUrl: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      phoneNumber: {
        type: DataTypes.STRING,
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

export default restCompanyTable;
