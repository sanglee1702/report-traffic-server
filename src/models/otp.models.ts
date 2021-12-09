import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface OTPModels extends ICreateOTPModels {
  id: number;
}

export enum OTPType {
  Login = 'Login',
}

export interface ICreateOTPModels extends IBaseModels {
  code: string;
  username: string;
  type: OTPType;
}

function restOTPTable(
  database: Sequelize,
): ModelCtor<Model<OTPModels, ICreateOTPModels>> {
  return database.define(
    TableNames.OTPCodes,
    {
      code: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      username: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(OTPType)),
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

export default restOTPTable;
