import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";
import { IBaseModels } from "./common/models.type";
import { ObjectStatus, TableNames } from "./common/models.enum";

export interface IWardModels extends ICreateWardModels {
  id: number;
}

export interface ICreateWardModels extends IBaseModels {
  name: string;
  code: string;
  level: string;
  districtCode: string;
}

function restWardTable(
  database: Sequelize
): ModelCtor<Model<IWardModels, ICreateWardModels>> {
  return database.define(
    TableNames.Wards,
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
      districtCode: {
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
      charset: "utf8mb4",
    }
  );
}

export default restWardTable;
