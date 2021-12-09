import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IBannerModels extends ICreateBannerModels {
  id: number;
}

export interface ICreateBannerModels extends IBaseModels {
  url: string;
  position: number;
  description?: string;
}

function restBannerTable(
  database: Sequelize,
): ModelCtor<Model<IBannerModels, ICreateBannerModels>> {
  return database.define(
    TableNames.Banners,
    {
      url: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      position: {
        type: DataTypes.INTEGER,
      },
      description: {
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

export default restBannerTable;
