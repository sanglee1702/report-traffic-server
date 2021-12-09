import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IMainCategoryModels extends ICreateMainCategoryModels {
  id: number;
}

export interface ICreateMainCategoryModels extends IBaseModels {
  name: string;
  avatarUrl: string;
  code: string;
}

function restMainCategoryTable(
  database: Sequelize,
): ModelCtor<Model<IMainCategoryModels, ICreateMainCategoryModels>> {
  return database.define(
    TableNames.ProductMainCategories,
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

export default restMainCategoryTable;
