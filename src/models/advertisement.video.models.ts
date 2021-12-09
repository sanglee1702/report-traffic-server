import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IAdvertisementVideoModels
  extends ICreateAdvertisementVideoModels {
  id: number;
}

export interface ICreateAdvertisementVideoModels extends IBaseModels {
  name: string;
  description: string;
  linkVideo: string;
  videoId: string;
  directLink: string;
}

function restAdvertisementVideoTable(
  database: Sequelize,
): ModelCtor<
  Model<IAdvertisementVideoModels, ICreateAdvertisementVideoModels>
> {
  return database.define(
    TableNames.AdvertisementVideos,
    {
      name: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      description: {
        type: DataTypes.TEXT,
      },
      linkVideo: {
        type: DataTypes.STRING,
      },
      videoId: {
        type: DataTypes.STRING,
      },
      directLink: {
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

export default restAdvertisementVideoTable;
