import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';
import { DiscountType } from './discount.code.models';

export interface IUserDiscountCodeModels extends ICreateUserDiscountCodeModels {
  id: number;
}

export interface ICreateUserDiscountCodeModels extends IBaseModels {
  userId?: number;
  code?: string;
  name?: string;
  description?: string;
  expireDate?: string | Date;
  numberOfUses?: number;
  percentDiscount?: number;
  discountAmount?: number;
  maximumDiscountAmount?: number;
  type?: DiscountType;
  avatarUrl?: string;
  thumbUrl?: string;
  brandName?: string;
  brandUrl?: string;
  brandThumbUrl?: string;
}

function restUserDiscountCodeTable(
  database: Sequelize,
): ModelCtor<Model<IUserDiscountCodeModels, ICreateUserDiscountCodeModels>> {
  return database.define(
    TableNames.UsersDiscountCodes,
    {
      userId: {
        type: DataTypes.INTEGER,
      },
      code: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      avatarUrl: {
        type: DataTypes.STRING,
      },
      thumbUrl: {
        type: DataTypes.STRING,
      },
      brandName: {
        type: DataTypes.STRING,
      },
      brandUrl: {
        type: DataTypes.STRING,
      },
      brandThumbUrl: {
        type: DataTypes.STRING,
      },
      expireDate: {
        type: DataTypes.DATE,
      },
      percentDiscount: {
        type: DataTypes.INTEGER,
      },
      discountAmount: {
        type: DataTypes.INTEGER,
      },
      maximumDiscountAmount: {
        type: DataTypes.INTEGER,
      },
      numberOfUses: {
        type: DataTypes.INTEGER,
      },
      type: {
        type: DataTypes.STRING,
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

export default restUserDiscountCodeTable;
