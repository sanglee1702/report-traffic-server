import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, PaidType, TableNames } from './common/models.enum';

export interface IDeliveryModels extends ICreateDeliveryModels {
  id: number;
}

export interface ICreateDeliveryModels extends IBaseModels {
  userId?: number;
  deliveryAddress?: string;
  phoneNumber?: string;
  description?: string;
  shippingStatus?: string;
  email?: string;
  fullName?: string;
  paidType?: PaidType;
  orderId?: string;
  provinceCode?: string;
  districtCode?: string;
  wardsCode?: string;
  totalPay?: number;
  discount?: number;
  fee?: number;
  total?: number;
}

function restDeliveryTable(
  database: Sequelize,
): ModelCtor<Model<IDeliveryModels, ICreateDeliveryModels>> {
  return database.define(
    TableNames.Deliveries,
    {
      deliveryAddress: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      fullName: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      total: {
        type: DataTypes.FLOAT,
      },
      totalPay: {
        type: DataTypes.FLOAT,
      },
      discount: {
        type: DataTypes.DOUBLE,
      },
      fee: {
        type: DataTypes.DOUBLE,
      },
      description: {
        type: DataTypes.JSON,
      },
      shippingStatus: {
        type: DataTypes.STRING,
      },
      provinceCode: {
        type: DataTypes.STRING,
      },
      districtCode: {
        type: DataTypes.STRING,
      },
      wardsCode: {
        type: DataTypes.STRING,
      },
      orderId: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      paidType: {
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

export default restDeliveryTable;
