import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, Roles, TableNames } from './common/models.enum';

export interface IAccountModels extends ICreateAccountModels {
  id: number;
}

export interface ICreateAccountModels extends IBaseModels {
  username?: string;
  token?: string;
  password?: string;
  hasExpired?: boolean;
  role?: Roles;
  referralCode?: string;
  hasEnteredReferralCode?: boolean;
  fcmToken?: string;
}

function restAccountTable(
  database: Sequelize,
): ModelCtor<Model<IAccountModels, ICreateAccountModels>> {
  return database.define(
    TableNames.Accounts,
    {
      username: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      password: {
        type: DataTypes.STRING,
      },
      token: {
        type: DataTypes.JSON,
      },
      referralCode: {
        type: DataTypes.STRING,
      },
      fcmToken: {
        type: DataTypes.STRING,
      },
      hasExpired: {
        type: DataTypes.BOOLEAN,
      },
      hasEnteredReferralCode: {
        type: DataTypes.BOOLEAN,
      },
      role: {
        type: DataTypes.ENUM(...Object.values(Roles)),
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

export default restAccountTable;
