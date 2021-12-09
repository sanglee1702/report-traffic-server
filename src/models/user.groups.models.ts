import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IGroupUserModels extends ICreateGroupUserModels {
  id: number;
}

export interface ICreateGroupUserModels extends IBaseModels {
  groupId: number;
  userId: number;
}

function restGroupUserTable(
  database: Sequelize,
): ModelCtor<Model<IGroupUserModels, ICreateGroupUserModels>> {
  return database.define(
    TableNames.GroupUsers,
    {
      groupId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
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

export default restGroupUserTable;
