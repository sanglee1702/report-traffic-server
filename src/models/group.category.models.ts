import { DataTypes, Model, ModelCtor, Sequelize } from "sequelize";
import { IBaseModels } from "./common/models.type";
import { ObjectStatus, TableNames } from "./common/models.enum";

export interface IGroupCategoryModels extends ICreateGroupCategoryModels {
  id: number;
}

export interface ICreateGroupCategoryModels extends IBaseModels {
  name: string;
  code: string;
}

function restGroupCategoryTable(
  database: Sequelize
): ModelCtor<Model<IGroupCategoryModels, ICreateGroupCategoryModels>> {
  return database.define(
    TableNames.GroupCategories,
    {
      name: {
        type: DataTypes.STRING,
      },
      code: {
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

export default restGroupCategoryTable;
