import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { FileType, ObjectStatus, TableNames } from './common/models.enum';

export interface IFileModels extends ICreateFileModels {
  id: number;
}

export interface ICreateFileModels extends IBaseModels {
  url: string;
  type: FileType;
  fileName: string;
}

function restFileTable(
  database: Sequelize,
): ModelCtor<Model<IFileModels, ICreateFileModels>> {
  return database.define(
    TableNames.Files,
    {
      url: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      type: {
        type: DataTypes.STRING,
      },
      fileName: {
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

export default restFileTable;
