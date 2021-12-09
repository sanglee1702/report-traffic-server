import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IChallengesModels extends ICreateChallengesModels {
  id: number;
}

export interface ICreateChallengesModels extends IBaseModels {
  totalDate?: number;
  price?: number;
  name?: string;
  avatarUrl?: string;
  totalRun?: number;
  minUserRun?: number;
  isGroupChallenges?: boolean;
  type?: string;
  giftReceivingMilestone?: string;
  backgrounds?: string;
  submittedBeforeDay?: number;
  discountPrice?: number;
  starDateDiscount?: string | Date;
  endDateDiscount?: string | Date;
  totalNumberOfDiscounts?: number;
}

function restChallengesTable(
  database: Sequelize,
): ModelCtor<Model<IChallengesModels, ICreateChallengesModels>> {
  return database.define(
    TableNames.Challenges,
    {
      totalDate: {
        type: DataTypes.FLOAT,
      },
      price: {
        type: DataTypes.DOUBLE,
      },
      name: {
        type: DataTypes.STRING,
      },
      avatarUrl: {
        type: DataTypes.STRING,
      },
      backgrounds: {
        type: DataTypes.TEXT,
      },
      totalRun: {
        type: DataTypes.FLOAT,
      },
      isGroupChallenges: {
        type: DataTypes.BOOLEAN,
      },
      minUserRun: {
        type: DataTypes.FLOAT,
      },
      submittedBeforeDay: {
        type: DataTypes.INTEGER,
      },
      discountPrice: {
        type: DataTypes.FLOAT,
      },
      starDateDiscount: {
        type: DataTypes.DATE,
      },
      endDateDiscount: {
        type: DataTypes.DATE,
      },
      totalNumberOfDiscounts: {
        type: DataTypes.INTEGER,
      },
      type: {
        type: DataTypes.STRING,
      },
      giftReceivingMilestone: {
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

export default restChallengesTable;
