import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, PaidType, TableNames } from './common/models.enum';

export enum ChallengeStatus {
  CreateNew = 'CreateNew',
  Completed = 'Completed',
  NotCompleted = 'NotCompleted',
}

export interface IUserChallengeModels extends ICreateUserChallengeModels {
  id: number;
}

export interface ICreateUserChallengeModels extends IBaseModels {
  challengesId?: number;
  userId?: number;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  totalRun?: number;
  groupId?: number;
  isPaid?: boolean;
  isCurrentChallenge?: boolean;
  currentGiftReceiving?: number; // current gift has open
  giftBoxesOpened?: string;
  orderId?: string;
  paidType?: PaidType;
  status?: ChallengeStatus;
  referralCode?: string;
}

function restUserChallengeTable(
  database: Sequelize,
): ModelCtor<Model<IUserChallengeModels, ICreateUserChallengeModels>> {
  return database.define(
    TableNames.UserChallenges,
    {
      challengesId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      userId: {
        type: DataTypes.INTEGER,
        validate: { notEmpty: true },
      },
      startDate: {
        type: DataTypes.DATE,
      },
      endDate: {
        type: DataTypes.DATE,
      },
      totalRun: {
        type: DataTypes.FLOAT,
      },
      groupId: {
        type: DataTypes.INTEGER,
      },
      paidType: {
        type: DataTypes.STRING,
      },
      currentGiftReceiving: {
        type: DataTypes.FLOAT,
      },
      referralCode: { type: DataTypes.STRING },
      status: {
        type: DataTypes.STRING,
      },
      giftBoxesOpened: {
        type: DataTypes.STRING,
      },
      orderId: {
        type: DataTypes.STRING,
      },
      isPaid: {
        type: DataTypes.BOOLEAN,
      },
      isCurrentChallenge: {
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

export default restUserChallengeTable;
