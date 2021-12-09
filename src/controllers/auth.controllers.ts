import { Request, Response } from "express";
import UserService from "../services/user.service";
import OTPService from "../services/otp.service";
import {
  PermissionError,
  ReporingError,
  UnauthorizedError,
} from "../utils/error";
import sendEmail from "../utils/send-email";
import { OTPType } from "../models/otp.models";
import {
  generateCode,
  generateOTP,
  hasEmail,
  hasPhoneNumber,
} from "../helpers";
import { ObjectStatus, Roles } from "../models/common/models.enum";
import AccountService, { IUserSearchParams } from "../services/account.service";
import { checkAuthentication } from "../helpers/authentication.helpers";
import { ICreateUserModels, IUserModels } from "../models/users.models";
import { ICreateAccountModels } from "../models/accounts.models";
import { BCryptHasher } from "../utils/hasher";
import { JWTAuthenticator } from "../authentication";
import logger from "../logs/logger";
import moment from "moment";
import exportExcel from "../utils/exportExcel";
import { envConfig } from "../config/env.config";

export interface IAddMoreInfosReq {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: Date | string | null;
  address?: string;
  accountId: number;
  companyId?: number;
  weight?: number;
  height?: number;
}

export interface ICreateUserReq {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: Date | string | null;
  address?: string;
  password: string;
  username: string;
  role: Roles;
  companyId?: number;
  weight?: number;
  height?: number;
}

export interface IUserRes extends IAddMoreInfosReq {
  id: number;
}

export interface ILoginRes {
  username: string;
  otpCode: string;
}

const _bCryptHasher = new BCryptHasher();
const _authenticator = new JWTAuthenticator();

const login = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const body: { username: string } = request.body;

  if (!body.username) {
    return result.status(400).send({ message: "Please enter username" });
  }

  const isEmail = hasEmail(body.username);
  const isPhoneNumber = hasPhoneNumber(body.username);

  if (!isEmail && !isPhoneNumber) {
    return result.status(400).send({ message: "Username is not valid" });
  }

  const isSend = await sendOTPCode(body.username);

  if (!isSend) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send({ isSend: isSend });
};

const confirmLogin = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const body: ILoginRes = request.body;
  const otpCode = body.otpCode;

  // check request data
  const isEmail = hasEmail(body.username);

  const isPhoneNumber = hasPhoneNumber(body.username);

  if (!isEmail && !isPhoneNumber) {
    return result.status(400).send({ message: "Username is not valid" });
  }
  if (!otpCode) {
    return result.status(400).send({ message: "OTP is required" });
  }

  // get otp code in data
  const otp = await OTPService.getByCode(otpCode);

  if (!otp) {
    return result.status(400).send({ message: "OTP is not available" });
  }

  // check otp if not valid then
  if (
    !(
      otp.code === otpCode &&
      body.username === otp.username &&
      otp.type === OTPType.Login
    )
  ) {
    return result.status(400).send({ message: "OTP is not available" });
  }

  console.log("isPhoneNumber", isPhoneNumber);
  console.log("isEmail", isEmail);

  if (isPhoneNumber) {
    // check if phone number is database
    const account = await AccountService.getByUserName(body.username);

    if (!account) {
      const referralCode = await generateReferralCode();
      // save token to server
      const newAccount = await AccountService.create({
        username: body.username,
        role: Roles.Users,
        referralCode: referralCode,
      });

      if (!newAccount) {
        return result.status(500).send(new ReporingError().toModel());
      }

      // if exit database then create
      const newUser = await UserService.create({
        phoneNumber: body.username,
        accountId: newAccount.id,
      });

      if (!newUser) {
        return result.status(500).send(new ReporingError().toModel());
      }

      await OTPService.delete(otpCode);
      const token = await _authenticator.authenticate(newUser, newAccount);

      // save new token to server
      await AccountService.updateToken(body.username, token, false);

      return result.send({
        isCreate: true,
        token: token,
        userId: newUser.id,
      });
    }

    if (account.objectStatus === ObjectStatus.DeActive) {
      return result.status(400).send({
        message: "User is inactive",
      });
    }

    // get user
    const user = await UserService.getByAccountId(account.id);

    await OTPService.delete(otpCode);
    const token = await _authenticator.authenticate(user, account);

    if (!account.referralCode) {
      const referralCode = await generateReferralCode();
      await AccountService.update(account.id, { referralCode });
    }
    // save new token to server
    await AccountService.updateToken(body.username, token, false);

    return result.send({
      isCreate: user.firstName ? false : true,
      token: token,
      userId: user.id,
    });
  } else if (isEmail) {
    const account = await AccountService.getByUserName(body.username);

    // if exit database then create
    if (!account) {
      const referralCode = await generateReferralCode();
      console.log("referralCode", referralCode);

      // save token to server
      const newAccount = await AccountService.create({
        username: body.username,
        role: Roles.Users,
        referralCode: referralCode,
      });

      if (!newAccount) {
        return result.status(500).send(new ReporingError().toModel());
      }

      const newUser = await UserService.create({
        email: body.username,
        accountId: newAccount.id,
      });

      if (!newUser) {
        return result.status(500).send(new ReporingError().toModel());
      }

      await OTPService.delete(otpCode);
      const token = await _authenticator.authenticate(newUser, newAccount);

      // save new token to server
      await AccountService.updateToken(body.username, token, false);

      return result.send({ isCreate: true, token: token, userId: newUser.id });
    }

    if (account.objectStatus === ObjectStatus.DeActive) {
      return result.status(400).send({
        message: "User is inactive",
      });
    }

    // get user
    const user = await UserService.getByAccountId(account.id);

    await OTPService.delete(otpCode);
    const token = await _authenticator.authenticate(user, account);

    if (!account.referralCode) {
      const referralCode = await generateReferralCode();
      await AccountService.update(account.id, { referralCode });
    }

    // save new token to server
    await AccountService.updateToken(body.username, token, false);

    return result.send({
      isCreate: user.firstName ? false : true,
      token: token,
      userId: user.id,
    });
  }
};

const logout = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const username = request.params.username;
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const account = await AccountService.getByUserName(username);
  if (!account) {
    return result.status(400).send({ message: "User not found" });
  }

  await AccountService.updateToken(username, "", true);

  return result.send({ message: "Logged out" });
};

const loginAdmin = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const body: { username: string; password: string } = request.body;

  if (!body.username) {
    return result.status(400).send({ message: "Please enter username" });
  }
  if (!body.password) {
    return result.status(400).send({ message: "Please enter password" });
  }

  const account = await AccountService.getByUserName(body.username);

  if (!account) {
    return result.status(400).send({
      message: "Username or password incorrect",
    });
  }

  if (account.objectStatus === ObjectStatus.DeActive) {
    return result.status(400).send({
      message: "User is inactive",
    });
  }

  const isValid = await _bCryptHasher.verifyPassword(
    body.password,
    account.password
  );

  if (!account || !isValid) {
    return result
      .status(400)
      .send({ message: "Username or password incorrect" });
  }

  const user = await UserService.getByAccountId(account.id);
  const token = await _authenticator.authenticate(
    user ? user : ({} as IUserModels),
    account
  );

  // save new token to server
  await AccountService.updateToken(body.username, token, false);

  return result.send({
    token: token,
    user: user ? UserService.toModel(user) : null,
  });
};

const createAdminUser = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateUserReq = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage = validateCreateUser(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(", "),
    });
  }

  if (data.role === "SuperAdmin" && authUser.role === Roles.Admin) {
    return result.status(403).send(new PermissionError().toModel());
  }

  const account = await AccountService.getByUserName(data.username);

  if (account) {
    return result.status(400).send({ message: "Username has been used!" });
  }

  const password = generateOTP();
  // hash password
  const passwordHash = await _bCryptHasher.hashPassword(password);

  const referralCode = await generateReferralCode();

  const accountData: ICreateAccountModels = {
    username: data.username,
    password: passwordHash,
    token: "",
    hasExpired: true,
    role: data.role || Roles.Admin,
    createdBy: authUser.id.toString(),
    referralCode,
  };

  const newAccount = await AccountService.create(accountData);

  if (!newAccount) {
    return result.status(500).send(new ReporingError().toModel());
  }

  //Create a user object
  const userData: ICreateUserModels = {
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth || null,
    address: data.address || null,
    phoneNumber: data.phoneNumber || null,
    email: data.email || null,
    avatarUrl: data.avatarUrl || null,
    accountId: newAccount.id,
    createdBy: authUser.id.toString(),
  };

  const newUser = await UserService.create(userData);

  if (!newUser) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send({ message: "Success" });
};

const updateAdminUser = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const accountId = Number(request.params.accountId);
  const data: ICreateUserReq & { status: ObjectStatus } = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  let errorMessage = validateCreateUser(data, false);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(", "),
    });
  }

  if (data.role === "SuperAdmin" && authUser.role === Roles.Admin) {
    return result.status(403).send(new PermissionError().toModel());
  }

  const account = await AccountService.getById(accountId);
  if (!account) {
    return result.status(400).send({ message: "Account not found" });
  }

  const user = await UserService.getByAccountId(accountId);

  //Create a user object
  const userData: ICreateUserModels = {
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth || null,
    address: data.address || null,
    phoneNumber: data.phoneNumber || null,
    email: data.email || null,
    accountId: accountId,
    objectStatus: data.status,
    updatedBy: authUser.id.toString(),
  };

  await AccountService.update(accountId, { objectStatus: data.status });

  if (!user) {
    const newUser = await UserService.create(userData);

    if (!newUser) {
      return result.status(500).send(new ReporingError().toModel());
    }
  } else {
    const hasUpdateUser = await UserService.update(user.id, userData);

    if (!hasUpdateUser) {
      return result.status(500).send(new ReporingError().toModel());
    }
  }

  return result.send({ message: "Success" });
};

const getUsers = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const query = request.query;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const users = await AccountService.getList(query as IUserSearchParams, [
    authUser.id,
  ]);

  return result.send(users);
};

const updatePassowrd = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const data: { newPassword: string; accountId: number } = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.Admin,
    Roles.SuperAdmin,
  ]);

  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  if (!data.newPassword) {
    return result.status(400).send({
      message: "New password is required",
    });
  }

  const account = await AccountService.getById(data.accountId);
  if (!account) {
    return result.status(400).send({ message: "Account not found" });
  }

  if (
    authUser.role === Roles.Admin &&
    (account.role === Roles.SuperAdmin || account.role === Roles.Admin)
  ) {
    return result.status(403).send(new PermissionError().toModel());
  }

  if (await _bCryptHasher.verifyPassword(data.newPassword, account.password)) {
    return result
      .status(400)
      .send({ message: "New password should not same old password" });
  }

  // hash password
  const passwordHash = await _bCryptHasher.hashPassword(data.newPassword);

  const hasUpdate = await AccountService.updatePassword(
    data.accountId,
    passwordHash,
    authUser.id
  );

  if (!hasUpdate) return result.status(500).send(new ReporingError().toModel());

  return result.send({ message: "Success" });
};

const deleteUserAsync = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request, [Roles.SuperAdmin]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const userId = Number(request.params.userId);

  if (authUser.id === userId) {
    return result
      .status(400)
      .send({ code: 400, message: "Không thể xoá tại khoản hiện tại!" });
  }

  const hasDelete = await AccountService.delete(userId);

  if (!hasDelete) return result.status(400).send({ message: "Không thể xoá!" });

  logger.info(JSON.stringify({ ...authUser, message: "delete user" }));

  return result.send({ message: "Success" });
};

const reportAccount = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const query = request.query;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const accounts = await AccountService.getListAccountReport(query);

  const columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Tài khoản", key: "username", width: 15 },
    { header: "Họ", key: "lastName", width: 15 },
    { header: "Tên", key: "firstName", width: 15 },
    { header: "Email", key: "email", width: 20 },
    { header: "Số điện thoại", key: "phoneNumber", width: 15 },
    { header: "Ngày sinh", key: "dateOfBirth", width: 15 },
    { header: "Loại tài khoản", key: "role", width: 15 },
    { header: "Địa chỉ", key: "address", width: 15 },
  ];

  // Looping through User data
  const data = accounts.items.map((item) => {
    return {
      ...item,
      dateOfBirth: item.dateOfBirth
        ? moment(item.dateOfBirth).format("YYYY-MM-DD")
        : "",
    };
  });

  try {
    const bufferFile = await exportExcel(columns, data);

    result.send(bufferFile);
  } catch (err) {
    result.send({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const updateFCMToken = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const data: { fcmToken: string } = request.body;

  const authUser = await checkAuthentication(request);

  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  if (!data.fcmToken) {
    return result.status(400).send({
      message: "FCM token bắt buộc nhập",
    });
  }

  const hasUpdate = await AccountService.updateFCMToken(
    authUser.id,
    data.fcmToken
  );
  if (!hasUpdate) {
    return result.status(400).send({ message: "Không thể cập nhật" });
  }

  if (!hasUpdate) return result.status(500).send(new ReporingError().toModel());

  return result.send({ message: "Success" });
};

const sendOTPCode = async (username: string): Promise<boolean> => {
  const hasSendCode = await OTPService.getByUserName(username);

  if (hasSendCode) {
    await OTPService.delete(hasSendCode.code);
  }

  const otp = await OTPService.create(username, OTPType.Login);

  if (!otp) {
    return false;
  }

  const content = `Ma OTP xac thuc cua ban la: ${otp}`;

  if (hasPhoneNumber(username))
    OTPService.sendOTPCodeToPhoneNumber(username, content);

  if (hasEmail(username)) {
    sendEmail(username, content, "Send OTP Code");
  }

  return true;
};

const validateCreateUser = (
  data: ICreateUserReq,
  isCreate: boolean = true
): string[] => {
  const errorDatas = {
    firstName: "First name is required",
    lastName: "Last name is required",
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  if (isCreate && !data.username) {
    message.push("Username is required");
  }
  if (data.email && !hasEmail(data.email)) {
    message.push("Email is not correct");
  }
  if (data.phoneNumber && !hasPhoneNumber(data.phoneNumber)) {
    message.push("Phone number is not correct");
  }

  return message;
};

const generateReferralCode = async (): Promise<string> => {
  const code = generateCode(8).toUpperCase();
  let referralCode = `${envConfig.START_OF_DISCOUNT_CODE}${code}`;

  if (!(await checkReferralCode(referralCode))) {
    return await generateReferralCode();
  }

  return referralCode;
};

const checkReferralCode = async (referralCode: string) => {
  const code = referralCode.toLowerCase();

  const account = await AccountService.getByReferralCode(code);

  if (account) {
    return false;
  }

  return true;
};

export default {
  login,
  confirmLogin,
  logout,
  loginAdmin,
  createAdminUser,
  updateAdminUser,
  getUsers,
  updatePassowrd,
  deleteUserAsync,
  reportAccount: reportAccount,
  updateFCMToken,
};
