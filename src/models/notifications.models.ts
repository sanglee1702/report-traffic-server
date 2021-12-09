import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { BasePagingReq, IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export enum Notifications {
  GeneralAnnoucement = 'GeneralAnnoucement',
}

export interface INotificationsRes {
  id: number;
  title: string;
  description?: string;
  thumb?: string;
  imageUrl?: string;
  userId?: number;
  moreData?: string;
  isRead: boolean;
  type?: Notifications;
  status: ObjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IGetNotificationsReq extends BasePagingReq {
  type?: Notifications;
  userId?: number;
}

export interface INotificationsModels extends ICreateNotificationsModels {
  id: number;
}

export interface ICreateNotificationsModels extends IBaseModels {
  title?: string;
  description?: string;
  thumb?: string;
  imageUrl?: string;
  userId?: number;
  moreData?: string;
  type?: Notifications;
  reads?: string; //accountId[]
  deletes?: string; //accountId []
}

function restNotificationsTable(
  database: Sequelize,
): ModelCtor<Model<INotificationsModels, ICreateNotificationsModels>> {
  return database.define(
    TableNames.Notifications,
    {
      title: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
      },
      thumb: {
        type: DataTypes.STRING,
      },
      imageUrl: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
      moreData: {
        type: DataTypes.JSON,
      },
      type: {
        type: DataTypes.STRING,
      },
      reads: {
        type: DataTypes.TEXT,
      },
      deletes: {
        type: DataTypes.TEXT,
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

export default restNotificationsTable;
