import { getAsync, postAsync } from '../utils/http-client';
import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import { OTPModels, OTPType } from '../models/otp.models';
import { envConfig } from '../config/env.config';
import { generateOTP } from '../helpers';

export interface IOTPService {
  create: (username: string, type: OTPType) => Promise<string | null>;
  getByCode: (code: string) => Promise<OTPModels>;
  getByUserName: (username: string) => Promise<OTPModels>;
  disabled: (code: string) => Promise<boolean>;
  getESMSBalance: () => Promise<ISMSBalance>;
  sendOTPCodeToPhoneNumber: (
    phoneNumber: string,
    content: string,
  ) => Promise<boolean>;
  getESMSBrandname: () => Promise<IBrandname>;
  delete: (code: string) => Promise<boolean>;
}

export enum ESMSStatus {
  UnknownError = '99',
  RequestSuccess = '100',
  LoginError = '101',
  AccountHasBeenLocked = '102',
  AccountBalanceIsNotEnough = '103',
  BrandnameError = '104',
  InvalidMessageType = '118',
}
export enum SmsType {
  Brandname = 2,
  Phone = 8,
}
export enum SandboxType {
  SendSMS = 0,
  NotSendSMS = 1,
}
export interface ISMSBalance {
  Balance: number;
  CodeResponse: ESMSStatus;
  UserID: number;
}
export interface ISendSMSRes {
  CodeResult: ESMSStatus;
  CountRegenerate: number;
  SMSID: number;
}
export interface ISendSMSReq {
  Phone: string;
  Content: string;
  ApiKey: string;
  SecretKey: string;
  SmsType: SmsType;
  Brandname?: string;
  Sandbox?: SandboxType;
  IsUnicode?: boolean;
}
export enum BrandnameType {
  Advertisement = 1,
  CustomerCare = 2,
}
export interface IBrandname {
  CodeResponse: ESMSStatus;
  ListBrandName: {
    Brandname: string;
    Type: BrandnameType;
  }[];
}

const _otpContext = dbContext.OtpContext;

const create = async (
  username: string,
  type: OTPType,
): Promise<string | null> => {
  const otp = generateOTP();

  const res = await _otpContext
    .create({ code: otp, username, type, objectStatus: ObjectStatus.Active })
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return otp;
  }

  return null;
};
const getByCode = async (code: string): Promise<OTPModels | null> => {
  const res = await _otpContext
    .findOne({
      where: { code, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const getByUserName = async (username: string): Promise<OTPModels | null> => {
  const res = await _otpContext
    .findOne({
      where: { username, objectStatus: ObjectStatus.Active },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) return res.get();

  return null;
};
const disabled = async (code: string): Promise<boolean> => {
  const res = await _otpContext
    .update(
      { objectStatus: ObjectStatus.DeActive },
      {
        where: { code },
      },
    )
    .catch((err) => {
      logger.error(err);
    });

  if (res && res[0] === 1) {
    return true;
  } else {
    return false;
  }
};
const deleteAsync = async (code: string): Promise<boolean> => {
  const res = await _otpContext
    .destroy({
      where: { code },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res === 1) {
    return true;
  } else {
    return false;
  }
};

// API esms https://esms.vn/
const getESMSBalance = async (): Promise<ISMSBalance> => {
  const balance = await postAsync(
    envConfig.ESMS_BASE_URL_API,
    'GetBalance_json',
    { ApiKey: envConfig.ESMS_APIKEY, SecretKey: envConfig.ESMS_SECRET_KEY },
  );

  return balance.data;
};
const sendOTPCodeToPhoneNumber = async (
  phoneNumber: string,
  content: string,
): Promise<boolean> => {
  const params: ISendSMSReq = {
    Phone: phoneNumber,
    Content: content,
    ApiKey: envConfig.ESMS_APIKEY,
    SecretKey: envConfig.ESMS_SECRET_KEY,
    SmsType: 8,
    IsUnicode: true,
  };

  const status = await postAsync(
    envConfig.ESMS_BASE_URL_API,
    'SendMultipleMessage_V4_post_json',
    params,
  );

  if (status.data) {
    return true;
  }

  return false;
};
const getESMSBrandname = async (): Promise<IBrandname> => {
  const url = `GetListBrandname/${envConfig.ESMS_APIKEY}/${envConfig.ESMS_SECRET_KEY}`;

  const brandname = await getAsync(envConfig.ESMS_BASE_URL_API, url);

  return brandname.data;
};

const OTPService: IOTPService = {
  create,
  getByCode,
  disabled,
  getESMSBalance,
  sendOTPCodeToPhoneNumber,
  getESMSBrandname,
  getByUserName,
  delete: deleteAsync,
};

export default OTPService;
