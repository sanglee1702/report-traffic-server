export enum Roles {
  SuperAdmin = "SuperAdmin",
  Admin = "Admin",
  Users = "Users",
  Anonymous = "Anonymous",
}

export enum ObjectStatus {
  Active = "active",
  DeActive = "deactive",
}

export enum TableNames {
  Accounts = "Accounts",
  Users = "Users",
  Groups = "Groups",
  Companies = "Companies",
  Points = "Points",
  PointHistories = "PointHistories",
  Challenges = "Challenges",
  UserChallenges = "UserChallenges",
  PaymentHistories = "PaymentHistories",
  OTPCodes = "OTPCodes",
  HistoryRuns = "HistoryRuns",
  CompanyEmployees = "CompanyEmployees",
  GroupUsers = "GroupUsers",
  Banners = "Banners",
  DeliveryAddresses = "DeliveryAddresses",
  ProductImages = "ProductImages",
  Wishlist = "Wishlist",
  ProductComments = "ProductComments",
  DeliveryProducts = "DeliveryProducts",
  GiftOpeningHistories = "GiftOpeningHistories",
  Provinces = "Provinces",
  Districts = "Districts",
  Wards = "Wards",
  Files = "Files",
  AdvertisementVideos = "AdvertisementVideos",
  Notifications = "Notifications",
  CardLink = "CardLinks",
  Categories = "Categories",
}

export enum OrderDirection {
  DESC = "DESC",
  ASC = "ASC",
}

export enum CashType {
  Points = "Points",
  Prices = "Prices",
}

export enum PaidType {
  Cash = "Cash",
  Points = "Points",
  Momo = "Momo",
  InternationalCard = "InternationalCard",
  ATM = "ATM",
}

export enum ShippingStatus {
  Create = "Create",
  Cash = "Cash",
  Pack = "Pack",
  Delivery = "Delivery",
  Delivered = "Delivered",
  Refund = "Refund",
  Refunded = "Refunded",
}

export enum FileType {
  Product = "Product",
  ProductThumbnail = "ProductThumbnail",
  UserAvatar = "UserAvatar",
  Articles = "Articles",
  Banner = "Banner",
  Challenges = "Challenges",
  Gift = "Gift",
  DiscountsThumb = "DiscountsThumb",
  DiscountsAvatar = "DiscountsAvatar",
}
