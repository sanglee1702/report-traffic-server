import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IGiftOpeningHistoryModels
  extends ICreateGiftOpeningHistoryModels {
  id: number;
}

export interface ICreateGiftOpeningHistoryModels extends IBaseModels {
  userId: number;
  advertisementVideo: string;
  discount: string;
  points: number;
}

function restGiftOpeningHistoryTable(
  database: Sequelize,
): ModelCtor<
  Model<IGiftOpeningHistoryModels, ICreateGiftOpeningHistoryModels>
> {
  return database.define(
    TableNames.GiftOpeningHistories,
    {
      userId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      advertisementVideo: {
        type: DataTypes.JSON,
      },
      discount: {
        type: DataTypes.JSON,
      },
      points: {
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

export default restGiftOpeningHistoryTable;
