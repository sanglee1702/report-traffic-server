import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IPointsModels extends ICreatePointsModels {
  id: number;
}

export interface ICreatePointsModels extends IBaseModels {
  point?: number;
  price?: number;
  userId?: number;
}

function restPointsTable(
  database: Sequelize,
): ModelCtor<Model<IPointsModels, ICreatePointsModels>> {
  return database.define(
    TableNames.Points,
    {
      point: {
        type: DataTypes.FLOAT,
      },
      price: {
        type: DataTypes.DOUBLE,
      },
      userId: {
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

export default restPointsTable;
