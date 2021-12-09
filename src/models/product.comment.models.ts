import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IProductCommentModels extends ICreateProductCommentModels {
  id: number;
}

export interface ICreateProductCommentModels extends IBaseModels {
  title: string;
  comment: string;
  userId: number;
  star: number;
  nameUserComment: string;
  email: string;
  productId: number;
}

function restProductCommentTable(
  database: Sequelize,
): ModelCtor<Model<IProductCommentModels, ICreateProductCommentModels>> {
  return database.define(
    TableNames.ProductComments,
    {
      title: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      comment: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      star: {
        type: DataTypes.FLOAT,
        validate: { notEmpty: true },
      },
      nameUserComment: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      productId: {
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

export default restProductCommentTable;
