import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, PaidType, TableNames } from './common/models.enum';

export interface IPaymentHistoriesModels extends ICreatePaymentHistoriesModels {
  id: number;
}

export interface ICreatePaymentHistoriesModels extends IBaseModels {
  userId: number;
  challengesId?: number;
  userChallengeId?: number;
  paidType: PaidType;
  description?: string;
  status?: string;
  orderId?: string;
  deliveryId?: number;
  totalPay?: number;
  discount?: number;
  fee?: number;
  total: number;
}

export interface IPaymentHistoriesRes {
  id: number;
  userId: number;
  challengeId?: number;
  userChallengeId?: number;
  paidType: PaidType;
  orderId?: string;
  deliveryId?: number;
  createdAt: string;
  updatedAt: string;
  totalPay?: number;
  discount?: number;
  fee?: number;
  total: number;
}

export interface IMoreDataPayment {
  challengeName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  description?: string;
  dataPayment?: string;
}

export interface IPaymentHistoriesDetailRes
  extends IPaymentHistoriesRes,
    IMoreDataPayment {}

function restPaymentHistoriesTable(
  database: Sequelize,
): ModelCtor<Model<IPaymentHistoriesModels, ICreatePaymentHistoriesModels>> {
  return database.define(
    TableNames.PaymentHistories,
    {
      userId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      challengesId: {
        type: DataTypes.INTEGER,
      },
      userChallengeId: {
        type: DataTypes.INTEGER,
      },
      deliveryId: {
        type: DataTypes.INTEGER,
      },
      paidType: {
        type: DataTypes.STRING,
      },
      total: {
        type: DataTypes.FLOAT,
      },
      totalPay: {
        type: DataTypes.FLOAT,
      },
      discount: {
        type: DataTypes.FLOAT,
      },
      fee: {
        type: DataTypes.FLOAT,
      },
      description: {
        type: DataTypes.JSON,
      },
      orderId: {
        type: DataTypes.STRING,
      },
      status: {
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

export default restPaymentHistoriesTable;
