import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface ICardLinkModels extends ICreateCardLinkModels {
  id: number;
}

export interface ICreateCardLinkModels extends IBaseModels {
  userId: number; // account id
  token: string;
  cardNumber: string;
  bankCode: string;
  method: string;
  bankType: string;
  cardLinkCode: string;
}

export interface ICardLinkRes {
  id: number;
  userId: number;
  token: string;
  cardNumber: string;
  bankCode: string;
  method: string;
  bankType: string;
  cardLinkCode: string;
}

function restCardLinkTable(
  database: Sequelize,
): ModelCtor<Model<ICardLinkModels, ICreateCardLinkModels>> {
  return database.define(
    TableNames.CardLink,
    {
      userId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      token: {
        type: DataTypes.STRING,
      },
      cardNumber: {
        type: DataTypes.STRING,
      },
      bankCode: {
        type: DataTypes.STRING,
      },
      method: {
        type: DataTypes.STRING,
      },
      bankType: {
        type: DataTypes.STRING,
      },
      cardLinkCode: {
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

export default restCardLinkTable;
