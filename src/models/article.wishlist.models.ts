import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IArticleWishlistModels extends IArticleCreateWishlistModels {
  id: number;
}

export interface IArticleCreateWishlistModels extends IBaseModels {
  userId: number;
  articleId: number;
}

function restArticleWishlistTable(
  database: Sequelize,
): ModelCtor<Model<IArticleWishlistModels, IArticleCreateWishlistModels>> {
  return database.define(
    TableNames.ArticleWishlist,
    {
      userId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      articleId: {
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

export default restArticleWishlistTable;
