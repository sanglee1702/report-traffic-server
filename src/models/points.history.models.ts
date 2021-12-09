import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IPointsHistoriesModels extends ICreatePointsHistoriesModels {
  id: number;
}

export interface ICreatePointsHistoriesModels extends IBaseModels {
  point: number;
  price: number;
  deliveryId: number;
  description: string;
}

function restPointsHistoriesTable(
  database: Sequelize,
): ModelCtor<Model<IPointsHistoriesModels, ICreatePointsHistoriesModels>> {
  return database.define(
    TableNames.PointHistories,
    {
      point: {
        type: DataTypes.FLOAT,
        validate: { notEmpty: true },
      },
      money: {
        type: DataTypes.DOUBLE,
        validate: { notEmpty: true },
      },
      deliveryId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      description: {
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

export default restPointsHistoriesTable;
