export interface ENV {
  DB_URL: string;
  SERVER_PORT: string;
  NODE_ENV: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB: string;
  SALT: string;
  ESMS_BASE_URL_API: string;
  ESMS_APIKEY: string;
  ESMS_SECRET_KEY: string;
  EMAIL_USERNAME: string;
  EMAIL_PASSWORD: string;
  PUPLIC_KEY_MOMO: string;
  MOMO_BASE_URL: string;
  MOMO_SECRET_KEY: string;
  SERVER_BASE_URL: string;
  MIKO_CHECK_KEY: string;
  MIKO_CHECK_KEY_MD5: string;
  MAX_NUMBER_BONUS_POINT: number;
  START_OF_DISCOUNT_CODE: string;
  PUPLIC_KEY_PAYMENT: string;
  PRIVATE_KEY_PAYMENT: string;
  MIKO_BASE_URL: string;
}

export const envConfig: ENV = {
  DB_URL: process.env.DB_URL,
  SERVER_PORT: process.env.SERVER_PORT,
  NODE_ENV: process.env.NODE_ENV,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB,
  SALT: process.env.SALT,
  ESMS_BASE_URL_API: process.env.ESMS_BASE_URL_API,
  ESMS_APIKEY: process.env.ESMS_APIKEY,
  ESMS_SECRET_KEY: process.env.ESMS_SECRET_KEY,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  PUPLIC_KEY_MOMO: process.env.PUPLIC_KEY_MOMO,
  MOMO_BASE_URL: process.env.MOMO_BASE_URL,
  MOMO_SECRET_KEY: process.env.MOMO_SECRET_KEY,
  SERVER_BASE_URL: process.env.SERVER_BASE_URL,
  MIKO_CHECK_KEY: process.env.MIKO_CHECK_KEY,
  MIKO_CHECK_KEY_MD5: process.env.MIKO_CHECK_KEY_MD5,
  MAX_NUMBER_BONUS_POINT: Number(process.env.MAX_NUMBER_BONUS_POINT),
  START_OF_DISCOUNT_CODE: process.env.START_OF_DISCOUNT_CODE,
  PUPLIC_KEY_PAYMENT: process.env.PUPLIC_KEY_PAYMENT,
  PRIVATE_KEY_PAYMENT: process.env.PRIVATE_KEY_PAYMENT,
  MIKO_BASE_URL: process.env.MIKO_BASE_URL,
};
