import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IDiscountCodeModels extends ICreateDiscountCodeModels {
  id: number;
}

export interface ICreateDiscountCodeModels extends IBaseModels {
  code: string;
  name: string;
  description: string;
  expireDate: string | Date;
  numberOfUses: number;
  percentDiscount: number;
  discountAmount: number;
  maximumDiscountAmount: number;
  type: DiscountType;
  avatarUrl: string;
  thumbUrl: string;
  brandName: string;
  brandUrl: string;
  brandThumbUrl: string;
}

export enum DiscountType {
  Product = 'Product',
  Challenge = 'Challenge',
}

function restDiscountCodeTable(
  database: Sequelize,
): ModelCtor<Model<IDiscountCodeModels, ICreateDiscountCodeModels>> {
  return database.define(
    TableNames.DiscountCodes,
    {
      name: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      code: {
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
      numberOfUses: {
        type: DataTypes.INTEGER,
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

export default restDiscountCodeTable;
