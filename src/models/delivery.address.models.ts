import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IDeliveryAddressModels extends ICreateDeliveryAddressModels {
  id: number;
}

export interface ICreateDeliveryAddressModels extends IBaseModels {
  address?: string;
  phoneNumber?: string;
  email?: string;
  userId?: number;
  fullName?: string;
  isDefault?: boolean;
  provinceCode?: string;
  districtCode?: string;
  wardsCode?: string;
}

function restDeliveryAddressTable(
  database: Sequelize,
): ModelCtor<Model<IDeliveryAddressModels, ICreateDeliveryAddressModels>> {
  return database.define(
    TableNames.DeliveryAddresses,
    {
      address: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        validate: { notEmpty: true },
      },
      email: {
        type: DataTypes.STRING,
      },
      userId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
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
      fullName: {
        type: DataTypes.STRING,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
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

export default restDeliveryAddressTable;
