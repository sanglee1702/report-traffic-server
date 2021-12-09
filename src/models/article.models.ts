import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IArticleModels extends ICreateArticleModels {
  id: number;
}

export interface ICreateArticleModels extends IBaseModels {
  title: string;
  description: string;
  code: string;
  banner: string;
  tag: string;
  categoryId: number;
  content: string;
}

function restArticleTable(
  database: Sequelize,
): ModelCtor<Model<IArticleModels, ICreateArticleModels>> {
  return database.define(
    TableNames.Articles,
    {
      title: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.STRING,
      },
      content: {
        type: DataTypes.TEXT,
      },
      code: {
        type: DataTypes.STRING,
      },
      banner: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      tag: {
        type: DataTypes.STRING,
      },
      categoryId: {
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

export default restArticleTable;
