import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IGroupsModels extends ICreateGroupsModels {
  id: number;
}

export interface ICreateGroupsModels extends IBaseModels {
  groupName: string;
  avaterUrl?: string;
  challengesId: number;
}

function restGroupsTable(
  database: Sequelize,
): ModelCtor<Model<IGroupsModels, ICreateGroupsModels>> {
  return database.define(
    TableNames.Groups,
    {
      groupName: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      avaterUrl: {
        type: DataTypes.STRING,
      },
      challengesId: {
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

export default restGroupsTable;
