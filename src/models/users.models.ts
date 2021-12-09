import { ObjectStatus, TableNames } from './common/models.enum';
import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';

export interface IUserModels extends ICreateUserModels {
  id: number;
}

export interface ICreateUserModels extends IBaseModels {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: Date | string | null;
  address?: string;
  accountId: number;
  companyId?: number;
  weight?: number;
  height?: number;
}

function restUsersTable(
  database: Sequelize,
): ModelCtor<Model<IUserModels, ICreateUserModels>> {
  return database.define(
    TableNames.Users,
    {
      firstName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      avatarUrl: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      dateOfBirth: {
        type: DataTypes.DATE,
      },
      address: {
        type: DataTypes.STRING,
      },
      phoneNumber: {
        type: DataTypes.STRING,
      },
      accountId: {
        type: DataTypes.INTEGER,
      },
      weight: {
        type: DataTypes.FLOAT,
      },
      height: {
        type: DataTypes.FLOAT,
      },
      companyId: {
        type: DataTypes.INTEGER,
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

export default restUsersTable;
