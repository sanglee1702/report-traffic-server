import { Request, Response } from 'express';
import { MessagingPayload } from 'firebase-admin/lib/messaging/messaging-api';
import moment from 'moment';
import { generateOrderId } from '../helpers';
import { checkAuthentication } from '../helpers/authentication.helpers';
import AccountService from '../services/account.service';
import { UnauthorizedError } from '../utils/error';
import admin from 'firebase-admin';
import NotificationsService from '../services/notifications.service';
import { IConfigAPP } from '../models/common/models.type';

const getOrderId = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const orderId = generateOrderId();

  return result.send(orderId);
};

const getCheckReferralCode = async (request: Request, result: Response) => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const code = request.params.referralCode;

  const message = await checkReferralCode(code, authUser.id);

  if (message) {
    return result.status(400).send({ message });
  }

  return result.send(true);
};

const pushNotification = async (
  _: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const payload: MessagingPayload = {
    notification: {
      title: 'This is a Notification',
      body: 'This is the body of the notification message.',
    },
    data: {
      account: 'Savings',
      balance: '$3020.25',
    },
  };

  const res = await admin.messaging().sendToTopic('notification', payload);

  return result.send(res);
};

const getConfigAPP = async (request: Request, result: Response) => {
  const authUser = await checkAuthentication(request);

  const numberNoRead = await NotificationsService.getNumberNotificationNoRead(
    authUser?.id,
  );

  return result.send(toModelConfig(numberNoRead));
};

//#region  more handle
export const checkReferralCode = async (
  referralCode: string,
  userId: number,
) => {
  const code = referralCode.toUpperCase();
  const referralAccount = await AccountService.getByReferralCode(code);
  const account = await AccountService.getById(userId);

  if (!referralAccount) {
    return 'Mã người giới thiệu không đúng!';
  }
  if (account && account.referralCode === code) {
    return 'Không được nhập mã của chính mình!';
  }
  if (
    referralAccount &&
    new Date(referralAccount.createdAt) > new Date(account.createdAt)
  ) {
    return 'Mã giới thiệu không hợp lệ!';
  }
  if (account.hasEnteredReferralCode) {
    return 'Bạn đã nhập mã giới thiệu trước đó!';
  }

  const expireDate = moment(account.createdAt)
    .set('dates', new Date().getDate() + 30)
    .toDate();

  if (expireDate < new Date()) {
    return 'Bạn đã hết thời hạn nhập mã giới thiệu!';
  }

  return '';
};

const toModelConfig = (numberNoRead: number): IConfigAPP => {
  return { noReadNotificationsNumber: numberNoRead };
};
//#endregion
export default {
  getOrderId,
  getCheckReferralCode: getCheckReferralCode,
  pushNotification,
  getConfigAPP,
};
