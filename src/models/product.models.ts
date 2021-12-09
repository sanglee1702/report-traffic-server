import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IProductModels extends ICreateProductModels {
  id: number;
}

export interface ICreateProductModels extends IBaseModels {
  name: string;
  code: string;
  categoryId: number;
  cashPrice: number;
  pointsPrice: number;
  description: string;
  saleOff: number;
  size: string;
  quantity: number;
  thumb: string;
  content: string;
  avatarUrl: string;
}

function restProductTable(
  database: Sequelize,
): ModelCtor<Model<IProductModels, ICreateProductModels>> {
  return database.define(
    TableNames.Products,
    {
      name: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      code: {
        type: DataTypes.STRING,
      },
      categoryId: {
        type: DataTypes.INTEGER,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
      cashPrice: {
        type: DataTypes.DOUBLE,
      },
      pointsPrice: {
        type: DataTypes.FLOAT,
      },
      content: {
        type: DataTypes.TEXT,
      },
      avatarUrl: {
        type: DataTypes.TEXT,
      },
      description: {
        type: DataTypes.STRING,
      },
      saleOff: {
        type: DataTypes.FLOAT,
      },
      size: {
        type: DataTypes.STRING,
      },
      thumb: {
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

export default restProductTable;
