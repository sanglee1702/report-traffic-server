import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";
import { IBaseModels } from "./common/models.type";
import { ObjectStatus, TableNames } from "./common/models.enum";

export interface ICategoryModels extends ICreateCategoryModels {
  id: number;
}

export interface ICreateCategoryModels extends IBaseModels {
  name: string;
  code: string;
  level: string;
}

function restCategoryTable(
  database: Sequelize
): ModelCtor<Model<ICategoryModels, ICreateCategoryModels>> {
  return database.define(
    TableNames.Categories,
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
      charset: "utf8mb4",
    }
  );
}

export default restCategoryTable;
