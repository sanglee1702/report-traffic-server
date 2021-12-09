import { Model, ModelCtor, Sequelize } from "sequelize";
import dbConfig from "../config/db.config";
import restAccountTable, {
  IAccountModels,
  ICreateAccountModels,
} from "./accounts.models";
import restPointsHistoriesTable, {
  IPointsHistoriesModels,
  ICreatePointsHistoriesModels,
} from "./points.history.models";
import restPointsTable, {
  IPointsModels,
  ICreatePointsModels,
} from "./points.models";
import restCompanyTable, {
  ICompanyModels,
  ICreateCompanyModels,
} from "./company.models";
import restGroupsTable, {
  ICreateGroupsModels,
  IGroupsModels,
} from "./groups.models";
import restPaymentHistoriesTable, {
  ICreatePaymentHistoriesModels,
  IPaymentHistoriesModels,
} from "./payment.histories.models";
import restOTPTable, { ICreateOTPModels, OTPModels } from "./otp.models";
import restUserChallengeTable, {
  ICreateUserChallengeModels,
  IUserChallengeModels,
} from "./user.challenge.models";
import restUsersTable, { ICreateUserModels, IUserModels } from "./users.models";
import restCompanyEmployeeTable, {
  ICompanyEmployeeModels,
  ICreateCompanyEmployeeModels,
} from "./company.employee.models";
import restGroupUserTable, {
  ICreateGroupUserModels,
  IGroupUserModels,
} from "./user.groups.models";
import restWishlistTable, {
  ICreateWishlistModels,
  IWishlistModels,
} from "./wishlist.models";
import restProvinceTable, {
  ICreateProvinceModels,
  IProvinceModels,
} from "./province.models";
import restDistrictTable, {
  ICreateDistrictModels,
  IDistrictModels,
} from "./district.models";
import restWardTable, { ICreateWardModels, IWardModels } from "./ward.models";
import restFileTable, { ICreateFileModels, IFileModels } from "./files.models";
import restNotificationsTable, {
  ICreateNotificationsModels,
  INotificationsModels,
} from "./notifications.models";

export interface IDBContext {
  databaseConfig: Sequelize;
  dropRestApiTable: () => void;
  UsersContext: ModelCtor<Model<IUserModels, ICreateUserModels>>;
  AccountsContext: ModelCtor<Model<IAccountModels, ICreateAccountModels>>;
  PointHistoriesContext: ModelCtor<
    Model<IPointsHistoriesModels, ICreatePointsHistoriesModels>
  >;
  PointContext: ModelCtor<Model<IPointsModels, ICreatePointsModels>>;
  CompanyContext: ModelCtor<Model<ICompanyModels, ICreateCompanyModels>>;
  GroupsContext: ModelCtor<Model<IGroupsModels, ICreateGroupsModels>>;
  PaymentHistoriesContext: ModelCtor<
    Model<IPaymentHistoriesModels, ICreatePaymentHistoriesModels>
  >;
  UserChallengensContext: ModelCtor<
    Model<IUserChallengeModels, ICreateUserChallengeModels>
  >;
  OtpContext: ModelCtor<Model<OTPModels, ICreateOTPModels>>;
  CompanyEmployeeContext: ModelCtor<
    Model<ICompanyEmployeeModels, ICreateCompanyEmployeeModels>
  >;
  GroupUserContext: ModelCtor<Model<IGroupUserModels, ICreateGroupUserModels>>;
  WishlistContext: ModelCtor<Model<IWishlistModels, ICreateWishlistModels>>;
  ProvinceContext: ModelCtor<Model<IProvinceModels, ICreateProvinceModels>>;
  DistrictContext: ModelCtor<Model<IDistrictModels, ICreateDistrictModels>>;
  WardContext: ModelCtor<Model<IWardModels, ICreateWardModels>>;
  FileContext: ModelCtor<Model<IFileModels, ICreateFileModels>>;
  NotificationsContext: ModelCtor<
    Model<INotificationsModels, ICreateNotificationsModels>
  >;
}

const dbUri = `${dbConfig.dialect}://${dbConfig.DB_URL}/${dbConfig.DB}`;

const database = new Sequelize(dbUri, {
  username: dbConfig.USER,
  password: dbConfig.PASSWORD,
  //dialect: dbConfig.dialect,
  operatorsAliases: {},
  //logging: (...msg) => logger.info(msg),
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
  define: {
    charset: "utf8mb4",
  },
});

const dbContext: IDBContext = {} as IDBContext;
dbContext.databaseConfig = database;
// function to drop existing tables and re-sync database
dbContext.dropRestApiTable = () => {
  dbContext.databaseConfig.sync({ force: true }).then(() => {
    console.log("restTutorial table just dropped and db re-synced.");
  });
};
dbContext.UsersContext = restUsersTable(database);
dbContext.AccountsContext = restAccountTable(database);
dbContext.PointHistoriesContext = restPointsHistoriesTable(database);
dbContext.PointContext = restPointsTable(database);
dbContext.CompanyContext = restCompanyTable(database);
dbContext.GroupsContext = restGroupsTable(database);
dbContext.PaymentHistoriesContext = restPaymentHistoriesTable(database);
dbContext.UserChallengensContext = restUserChallengeTable(database);
dbContext.OtpContext = restOTPTable(database);
dbContext.CompanyEmployeeContext = restCompanyEmployeeTable(database);
dbContext.GroupUserContext = restGroupUserTable(database);
dbContext.WishlistContext = restWishlistTable(database);
dbContext.ProvinceContext = restProvinceTable(database);
dbContext.DistrictContext = restDistrictTable(database);
dbContext.WardContext = restWardTable(database);
dbContext.FileContext = restFileTable(database);
dbContext.NotificationsContext = restNotificationsTable(database);

// get
dbContext.AccountsContext.hasOne(dbContext.UsersContext, {
  foreignKey: "accountId",
  onDelete: "CASCADE",
});

export default dbContext;
