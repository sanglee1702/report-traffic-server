import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IHistoryRunModels extends ICreateHistoryRunModels {
  id: number;
}

export interface ICreateHistoryRunModels extends IBaseModels {
  totalRun: number;
  userChallengeId?: number;
  description?: string;
  userId?: number;
  type?: string;
}

function restHistoryRunTable(
  database: Sequelize,
): ModelCtor<Model<IHistoryRunModels, ICreateHistoryRunModels>> {
  return database.define(
    TableNames.HistoryRuns,
    {
      totalRun: {
        type: DataTypes.FLOAT,
        validate: { notEmpty: true },
      },
      userChallengeId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.STRING,
      },
      userId: {
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

export default restHistoryRunTable;
