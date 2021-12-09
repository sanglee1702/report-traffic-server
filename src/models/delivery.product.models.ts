import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IDeliveryProductModels extends ICreateDeliveryProductModels {
  id: number;
}

export interface ICreateDeliveryProductModels extends IBaseModels {
  deliveryId: number;
  productId: number;
  quantity: number;
  size: string;
}

function restDeliveryProductTable(
  database: Sequelize,
): ModelCtor<Model<IDeliveryProductModels, ICreateDeliveryProductModels>> {
  return database.define(
    TableNames.DeliveryProducts,
    {
      deliveryId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      productId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      quantity: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      size: {
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

export default restDeliveryProductTable;
