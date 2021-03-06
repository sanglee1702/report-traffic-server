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
    return 'M?? ng?????i gi???i thi???u kh??ng ????ng!';
  }
  if (account && account.referralCode === code) {
    return 'Kh??ng ???????c nh???p m?? c???a ch??nh m??nh!';
  }
  if (
    referralAccount &&
    new Date(referralAccount.createdAt) > new Date(account.createdAt)
  ) {
    return 'M?? gi???i thi???u kh??ng h???p l???!';
  }
  if (account.hasEnteredReferralCode) {
    return 'B???n ???? nh???p m?? gi???i thi???u tr?????c ????!';
  }

  const expireDate = moment(account.createdAt)
    .set('dates', new Date().getDate() + 30)
    .toDate();

  if (expireDate < new Date()) {
    return 'B???n ???? h???t th???i h???n nh???p m?? gi???i thi???u!';
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
