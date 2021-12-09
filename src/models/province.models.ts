import { DataTypes, Model, ModelCtor, Sequelize } from 'sequelize';
import { IBaseModels } from './common/models.type';
import { ObjectStatus, TableNames } from './common/models.enum';

export interface IProvinceModels extends ICreateProvinceModels {
  id: number;
}

export interface ICreateProvinceModels extends IBaseModels {
  name: string;
  code: string;
  level: string;
}

function restProvinceTable(
  database: Sequelize,
): ModelCtor<Model<IProvinceModels, ICreateProvinceModels>> {
  return database.define(
    TableNames.Provinces,
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

export default restProvinceTable;
