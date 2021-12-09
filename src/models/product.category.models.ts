import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface ProductCategoryModels extends ICreateProductCategoryModels {
  id: number;
}

export interface ICreateProductCategoryModels extends IBaseModels {
  name: string;
  avatarUrl: string;
  code: string;
  mainCategoryId: number;
}

function restProductCategoryTable(
  database: Sequelize,
): ModelCtor<Model<ProductCategoryModels, ICreateProductCategoryModels>> {
  return database.define(
    TableNames.ProductCategories,
    {
      name: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      mainCategoryId: {
        type: DataTypes.INTEGER,
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

export default restProductCategoryTable;
