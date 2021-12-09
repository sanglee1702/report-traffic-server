import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IDistrictModels extends ICreateDistrictModels {
  id: number;
}

export interface ICreateDistrictModels extends IBaseModels {
  name: string;
  code: string;
  level: string;
  provinceCode: string;
}

function restDistrictTable(
  database: Sequelize,
): ModelCtor<Model<IDistrictModels, ICreateDistrictModels>> {
  return database.define(
    TableNames.Districts,
    {
      name: {
        type: DataTypes.STRING,
      },
      code: {
        type: DataTypes.STRING,
      },
      level: {
        type: DataTypes.STRING,
      },
      provinceCode: {
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

export default restDistrictTable;
