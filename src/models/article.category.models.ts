import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IArticleCategoryModels extends ICreateArticleCategoryModels {
  id: number;
}

export interface ICreateArticleCategoryModels extends IBaseModels {
  name: string;
  avatarUrl: string;
  code: string;
}

function restArticleCategoryTable(
  database: Sequelize,
): ModelCtor<Model<IArticleCategoryModels, ICreateArticleCategoryModels>> {
  return database.define(
    TableNames.ArticleCategories,
    {
      name: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      code: {
        type: DataTypes.STRING,
      },
      avatarUrl: {
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

export default restArticleCategoryTable;
