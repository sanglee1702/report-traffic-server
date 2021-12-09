import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IWishlistModels extends ICreateWishlistModels {
  id: number;
}

export interface ICreateWishlistModels extends IBaseModels {
  userId: number;
  productId: number;
}

function restWishlistTable(
  database: Sequelize,
): ModelCtor<Model<IWishlistModels, ICreateWishlistModels>> {
  return database.define(
    TableNames.Wishlist,
    {
      userId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      productId: {
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

export default restWishlistTable;
