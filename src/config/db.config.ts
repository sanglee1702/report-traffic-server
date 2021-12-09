import { Dialect } from 'sequelize/types';
import { envConfig } from './env.config';

export interface IDBConfig {
  DB_URL: string;
  DB: string;
  USER: string;
  PASSWORD: string;
  dialect: Dialect;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

export default {
  DB_URL: envConfig.DB_URL,
  USER: envConfig.DB_USER,
  PASSWORD: envConfig.DB_PASSWORD,
  DB: envConfig.DB,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
    //evict: 1000,
  },
} as IDBConfig;
