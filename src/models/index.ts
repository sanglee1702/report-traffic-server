import { Model, ModelCtor, Sequelize } from 'sequelize';
import dbConfig from '../config/db.config';
import restAccountTable, {
  IAccountModels,
  ICreateAccountModels,
} from './accounts.models';
import restPointsHistoriesTable, {
  IPointsHistoriesModels,
  ICreatePointsHistoriesModels,
} from './points.history.models';
import restPointsTable, {
  IPointsModels,
  ICreatePointsModels,
} from './points.models';
import restChallengesTable, {
  IChallengesModels,
  ICreateChallengesModels,
} from './challenges.models';
import restCompanyTable, {
  ICompanyModels,
  ICreateCompanyModels,
} from './company.models';
import restGroupsTable, {
  ICreateGroupsModels,
  IGroupsModels,
} from './groups.models';
import restPaymentHistoriesTable, {
  ICreatePaymentHistoriesModels,
  IPaymentHistoriesModels,
} from './payment.histories.models';
import restOTPTable, { ICreateOTPModels, OTPModels } from './otp.models';
import restUserChallengeTable, {
  ICreateUserChallengeModels,
  IUserChallengeModels,
} from './user.challenge.models';
import restUsersTable, { ICreateUserModels, IUserModels } from './users.models';
import restArticleCategoryTable, {
  IArticleCategoryModels,
  ICreateArticleCategoryModels,
} from './article.category.models';
import restArticleTable, {
  IArticleModels,
  ICreateArticleModels,
} from './article.models';
import restBannerTable, {
  IBannerModels,
  ICreateBannerModels,
} from './banner.models';
import restCompanyEmployeeTable, {
  ICompanyEmployeeModels,
  ICreateCompanyEmployeeModels,
} from './company.employee.models';
import restDeliveryAddressTable, {
  IDeliveryAddressModels,
  ICreateDeliveryAddressModels,
} from './delivery.address.models';
import restDeliveryTable, {
  IDeliveryModels,
  ICreateDeliveryModels,
} from './delivery.models';
import restDeliveryProductTable, {
  IDeliveryProductModels,
  ICreateDeliveryProductModels,
} from './delivery.product.models';
import restHistoryRunTable, {
  IHistoryRunModels,
  ICreateHistoryRunModels,
} from './history.run.models';
import restMainCategoryTable, {
  ICreateMainCategoryModels,
  IMainCategoryModels,
} from './product.main.category.models';
import restProductCategoryTable, {
  ICreateProductCategoryModels,
  ProductCategoryModels,
} from './product.category.models';
import restProductCommentTable, {
  ICreateProductCommentModels,
  IProductCommentModels,
} from './product.comment.models';
import restProductTable, {
  ICreateProductModels,
  IProductModels,
} from './product.models';
import restGroupUserTable, {
  ICreateGroupUserModels,
  IGroupUserModels,
} from './user.groups.models';
import restWishlistTable, {
  ICreateWishlistModels,
  IWishlistModels,
} from './wishlist.models';
import restDiscountCodeTable, {
  ICreateDiscountCodeModels,
  IDiscountCodeModels,
} from './discount.code.models';
import restGiftOpeningHistoryTable, {
  ICreateGiftOpeningHistoryModels,
  IGiftOpeningHistoryModels,
} from './gift.opening.history.models';
import restArticleWishlistTable, {
  IArticleCreateWishlistModels,
  IArticleWishlistModels,
} from './article.wishlist.models';
import restProvinceTable, {
  ICreateProvinceModels,
  IProvinceModels,
} from './province.models';
import restDistrictTable, {
  ICreateDistrictModels,
  IDistrictModels,
} from './district.models';
import restWardTable, { ICreateWardModels, IWardModels } from './ward.models';
import restFileTable, { ICreateFileModels, IFileModels } from './files.models';
import restAdvertisementVideoTable, {
  IAdvertisementVideoModels,
  ICreateAdvertisementVideoModels,
} from './advertisement.video.models';
import restUserDiscountCodeTable, {
  ICreateUserDiscountCodeModels,
  IUserDiscountCodeModels,
} from './user.discount.code.models';
import restNotificationsTable, {
  ICreateNotificationsModels,
  INotificationsModels,
} from './notifications.models';
import restCardLinkTable, {
  ICardLinkModels,
  ICreateCardLinkModels,
} from './card.link.models';

export interface IDBContext {
  databaseConfig: Sequelize;
  dropRestApiTable: () => void;
  UsersContext: ModelCtor<Model<IUserModels, ICreateUserModels>>;
  AccountsContext: ModelCtor<Model<IAccountModels, ICreateAccountModels>>;
  PointHistoriesContext: ModelCtor<
    Model<IPointsHistoriesModels, ICreatePointsHistoriesModels>
  >;
  PointContext: ModelCtor<Model<IPointsModels, ICreatePointsModels>>;
  ChallengensContext: ModelCtor<
    Model<IChallengesModels, ICreateChallengesModels>
  >;
  CompanyContext: ModelCtor<Model<ICompanyModels, ICreateCompanyModels>>;
  GroupsContext: ModelCtor<Model<IGroupsModels, ICreateGroupsModels>>;
  PaymentHistoriesContext: ModelCtor<
    Model<IPaymentHistoriesModels, ICreatePaymentHistoriesModels>
  >;
  UserChallengensContext: ModelCtor<
    Model<IUserChallengeModels, ICreateUserChallengeModels>
  >;
  OtpContext: ModelCtor<Model<OTPModels, ICreateOTPModels>>;
  ArticleCategoryContext: ModelCtor<
    Model<IArticleCategoryModels, ICreateArticleCategoryModels>
  >;
  ArticleContext: ModelCtor<Model<IArticleModels, ICreateArticleModels>>;
  ArticleWishlistContext: ModelCtor<
    Model<IArticleWishlistModels, IArticleCreateWishlistModels>
  >;
  BannerContext: ModelCtor<Model<IBannerModels, ICreateBannerModels>>;
  CompanyEmployeeContext: ModelCtor<
    Model<ICompanyEmployeeModels, ICreateCompanyEmployeeModels>
  >;
  DeliveryAddressContext: ModelCtor<
    Model<IDeliveryAddressModels, ICreateDeliveryAddressModels>
  >;
  DeliveryContext: ModelCtor<Model<IDeliveryModels, ICreateDeliveryModels>>;
  DeliveryProductContext: ModelCtor<
    Model<IDeliveryProductModels, ICreateDeliveryProductModels>
  >;
  HistoryRunContext: ModelCtor<
    Model<IHistoryRunModels, ICreateHistoryRunModels>
  >;
  ProductMainCategoryContext: ModelCtor<
    Model<IMainCategoryModels, ICreateMainCategoryModels>
  >;
  ProductCategoryContext: ModelCtor<
    Model<ProductCategoryModels, ICreateProductCategoryModels>
  >;
  ProductContext: ModelCtor<Model<IProductModels, ICreateProductModels>>;
  ProductCommentContext: ModelCtor<
    Model<IProductCommentModels, ICreateProductCommentModels>
  >;
  GroupUserContext: ModelCtor<Model<IGroupUserModels, ICreateGroupUserModels>>;
  WishlistContext: ModelCtor<Model<IWishlistModels, ICreateWishlistModels>>;
  GiftOpeningHistoryContext: ModelCtor<
    Model<IGiftOpeningHistoryModels, ICreateGiftOpeningHistoryModels>
  >;
  ProvinceContext: ModelCtor<Model<IProvinceModels, ICreateProvinceModels>>;
  DistrictContext: ModelCtor<Model<IDistrictModels, ICreateDistrictModels>>;
  WardContext: ModelCtor<Model<IWardModels, ICreateWardModels>>;
  FileContext: ModelCtor<Model<IFileModels, ICreateFileModels>>;
  DiscountCodeContext: ModelCtor<
    Model<IDiscountCodeModels, ICreateDiscountCodeModels>
  >;
  AdvertisementVideoContext: ModelCtor<
    Model<IAdvertisementVideoModels, ICreateAdvertisementVideoModels>
  >;
  UserDiscountCodeContext: ModelCtor<
    Model<IUserDiscountCodeModels, ICreateUserDiscountCodeModels>
  >;
  NotificationsContext: ModelCtor<
    Model<INotificationsModels, ICreateNotificationsModels>
  >;
  CardLinksContext: ModelCtor<Model<ICardLinkModels, ICreateCardLinkModels>>;
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
    charset: 'utf8mb4',
  },
});

const dbContext: IDBContext = {} as IDBContext;
dbContext.databaseConfig = database;
// function to drop existing tables and re-sync database
dbContext.dropRestApiTable = () => {
  dbContext.databaseConfig.sync({ force: true }).then(() => {
    console.log('restTutorial table just dropped and db re-synced.');
  });
};
dbContext.UsersContext = restUsersTable(database);
dbContext.AccountsContext = restAccountTable(database);
dbContext.PointHistoriesContext = restPointsHistoriesTable(database);
dbContext.PointContext = restPointsTable(database);
dbContext.ChallengensContext = restChallengesTable(database);
dbContext.CompanyContext = restCompanyTable(database);
dbContext.GroupsContext = restGroupsTable(database);
dbContext.PaymentHistoriesContext = restPaymentHistoriesTable(database);
dbContext.UserChallengensContext = restUserChallengeTable(database);
dbContext.OtpContext = restOTPTable(database);
dbContext.ArticleCategoryContext = restArticleCategoryTable(database);
dbContext.ArticleContext = restArticleTable(database);
dbContext.BannerContext = restBannerTable(database);
dbContext.CompanyEmployeeContext = restCompanyEmployeeTable(database);
dbContext.DeliveryAddressContext = restDeliveryAddressTable(database);
dbContext.DeliveryContext = restDeliveryTable(database);
dbContext.DeliveryProductContext = restDeliveryProductTable(database);
dbContext.HistoryRunContext = restHistoryRunTable(database);
dbContext.ProductMainCategoryContext = restMainCategoryTable(database);
dbContext.ProductCategoryContext = restProductCategoryTable(database);
dbContext.ProductContext = restProductTable(database);
dbContext.ProductCommentContext = restProductCommentTable(database);
dbContext.GroupUserContext = restGroupUserTable(database);
dbContext.WishlistContext = restWishlistTable(database);
dbContext.DiscountCodeContext = restDiscountCodeTable(database);
dbContext.AdvertisementVideoContext = restAdvertisementVideoTable(database);
dbContext.GiftOpeningHistoryContext = restGiftOpeningHistoryTable(database);
dbContext.ArticleWishlistContext = restArticleWishlistTable(database);
dbContext.ProvinceContext = restProvinceTable(database);
dbContext.DistrictContext = restDistrictTable(database);
dbContext.WardContext = restWardTable(database);
dbContext.FileContext = restFileTable(database);
dbContext.UserDiscountCodeContext = restUserDiscountCodeTable(database);
dbContext.NotificationsContext = restNotificationsTable(database);
dbContext.CardLinksContext = restCardLinkTable(database);

// get
dbContext.DeliveryContext.hasMany(dbContext.DeliveryProductContext, {
  foreignKey: 'deliveryId',
  onDelete: 'SET NULL',
});
dbContext.ProductContext.hasOne(dbContext.WishlistContext, {
  foreignKey: 'productId',
  onDelete: 'SET NULL',
});
dbContext.ArticleContext.hasOne(dbContext.ArticleWishlistContext, {
  foreignKey: 'articleId',
  onDelete: 'SET NULL',
});
dbContext.AccountsContext.hasOne(dbContext.UsersContext, {
  foreignKey: 'accountId',
  onDelete: 'CASCADE',
});
dbContext.ProductCategoryContext.belongsTo(
  dbContext.ProductMainCategoryContext,
  {
    foreignKey: 'mainCategoryId',
    onDelete: 'SET NULL',
  },
);
dbContext.ProductMainCategoryContext.hasMany(dbContext.ProductCategoryContext, {
  foreignKey: 'mainCategoryId',
  onDelete: 'SET NULL',
});
dbContext.ProductCategoryContext.belongsTo(
  dbContext.ProductMainCategoryContext,
  {
    foreignKey: 'mainCategoryId',
    onDelete: 'SET NULL',
  },
);
dbContext.ProductCategoryContext.hasMany(dbContext.ProductContext, {
  foreignKey: 'categoryId',
  onDelete: 'SET NULL',
});
dbContext.ProductContext.belongsTo(dbContext.ProductCategoryContext, {
  foreignKey: 'categoryId',
  onDelete: 'SET NULL',
});
dbContext.ArticleContext.belongsTo(dbContext.ArticleCategoryContext, {
  foreignKey: 'categoryId',
  onDelete: 'SET NULL',
});
dbContext.ArticleCategoryContext.hasMany(dbContext.ArticleContext, {
  foreignKey: 'categoryId',
  onDelete: 'SET NULL',
});

export default dbContext;
