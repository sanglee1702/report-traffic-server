import { Request, Response } from 'express';
import moment from 'moment';
import { generateOrderId } from '../helpers';
import { checkAuthentication } from '../helpers/authentication.helpers';
import { AlepayRes, MomoPaymentReq } from '../models/common/models.type';
import {
  CashType,
  PaidType,
  Roles,
  ShippingStatus,
} from '../models/common/models.enum';
import {
  ChallengeStatus,
  ICreateUserChallengeModels,
} from '../models/user.challenge.models';
import ChallengeService from '../services/challenges.service';
import UserChallengenService from '../services/user.challenge.service';
import { ReporingError, UnauthorizedError } from '../utils/error';
import { getAsync, postAsync } from '../utils/http-client';
import { createHmac } from 'crypto';
import { envConfig } from '../config/env.config';
import logger from '../logs/logger';
import PaymentHistoryService from '../services/payment.histories.service';
import {
  ICreatePaymentHistoriesModels,
  IMoreDataPayment,
} from '../models/payment.histories.models';
import DeliveryProductService from '../services/delivery.product.service';
import { ICreateDeliveryProductModels } from '../models/delivery.product.models';
import DeliveryService from '../services/delivery.service';
import { ICreateDeliveryModels } from '../models/delivery.models';
import PointService from '../services/point.service';
import ProductService from '../services/product.service';
import PointHistoryService from '../services/point.history.service';
import { ICreatePointsHistoriesModels } from '../models/points.history.models';
import UserService from '../services/user.service';
import exportExcel from '../utils/exportExcel';
import { checkReferralCode } from './common.controllers';
import AccountService from '../services/account.service';
import { plusPointToUser } from './user.controller';
import {
  IChallengesModels,
  ICreateChallengesModels,
} from '../models/challenges.models';
import UserDiscountCodeService from '../services/user.discount.code.service';
import HybridCryptoHash from '../utils/hybrid-crypto-hash';
import CardLinkService from '../services/card.link.service';

const NodeRSA = require('node-rsa');

export interface ICreateUserChallengeReq {
  challengesId: number;
  groupId: number;
  paidType: PaidType;
  orderId: string;
  description: string;
  referralCode?: string;
}

export interface IConfirmUserChallengeReq {
  challengesId: number;
  groupId: number;
  paidType: PaidType;
  momoData?: MomoPaymentReq;
  alepayParams?: AlepayRes;
  totalPay?: number;
  total?: number;
  discount?: number;
  fee?: number;
  orderId: string;
  referralCode?: string;
  discountCode?: string;
}

export interface IBuyProductsReq {
  phoneNumber: string;
  deliveryAddress: string;
  fullName: string;
  email: string;
  products: {
    productId: number;
    quantity: number;
    cashType: CashType;
    size: string;
  }[];
  provinceCode: string;
  districtCode: string;
  wardsCode: string;
  paidType: PaidType;
  orderId: string;
  description: string;
  discountCode?: string;
  totalPay: number;
  total: number;
  discount?: number;
  fee?: number;
}

export interface IBuyProductsForMoneyReq extends IBuyProductsReq {
  momoData?: MomoPaymentReq;
  alepayParams?: AlepayRes;
}

//#region  challenges
const createPaymentChallenge = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const body = request.body;

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const data: ICreateUserChallengeReq = HybridCryptoHash.decryption(body.data);
  if (!data) {
    return result
      .status(400)
      .send({ message: 'Dữ liệu thanh toán không đúng!' });
  }

  if (data.referralCode) {
    const message = await checkReferralCode(data.referralCode, authUser.id);

    if (message) {
      return result.status(400).send({ message });
    }
  }
  // check has current challenge
  const currentUserChallenge = await UserChallengenService.getCurrent(
    authUser.id,
  );

  // get challenge
  const challenge = await ChallengeService.getById(data.challengesId);
  if (!challenge) {
    logger.error({ data, message: 'Challenge not found' });
    return result.status(400).send({ message: 'Không tìm thấy thử thách' });
  }

  const userChallengeData: ICreateUserChallengeModels = {
    challengesId: data.challengesId,
    groupId: data.groupId || null,
    isPaid: false,
    startDate: null,
    endDate: null,
    totalRun: challenge.totalRun,
    userId: authUser.id,
    isCurrentChallenge: true,
    currentGiftReceiving: 0,
    giftBoxesOpened: '',
    createdBy: authUser.id.toString(),
    orderId: data.orderId,
    paidType: data.paidType,
    status: ChallengeStatus.CreateNew,
    referralCode: data.referralCode,
  };

  if (currentUserChallenge && currentUserChallenge.isPaid) {
    logger.error({ ...data, message: 'Challenge already exists' });
    return result.status(400).send({
      message:
        'Please complete the challenge before applying for a new challenge',
    });
  } else if (currentUserChallenge && !currentUserChallenge.isPaid) {
    await UserChallengenService.update(
      currentUserChallenge.id,
      userChallengeData,
    );
  } else {
    await UserChallengenService.create(userChallengeData);
  }

  return result.send({ message: 'Success!' });
};
const confirmPaymentChallenge = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const body = request.body;

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const data: IConfirmUserChallengeReq = HybridCryptoHash.decryption(body.data);
  if (!data) {
    return result
      .status(400)
      .send({ message: 'Dữ liệu thanh toán không đúng!' });
  }

  if (!data.challengesId) {
    return result.status(400).send({ message: 'Invalid challenge id' });
  }
  if (!data.paidType) {
    return result.status(400).send({ message: 'PaidType is required' });
  }

  const challenge = await ChallengeService.getById(data.challengesId);
  if (!challenge) {
    logger.error({ ...data, message: 'Challenge not found' });
    return result.status(400).send({ message: 'Không tìm thấy thử thách' });
  }

  const isPaymentMomo = data.paidType === PaidType.Momo;
  const orderId = isPaymentMomo
    ? data.momoData.orderId
    : data.alepayParams.orderCode;

  // check has current challenge
  const currentUserChallenge = await UserChallengenService.getByOrderId(
    orderId,
  );
  if (!currentUserChallenge) {
    logger.error({ ...data, message: 'Current User Challenge not found' });
    return result
      .status(400)
      .send({ message: 'Current User Challenge not found' });
  }

  // if user challenge is confirm
  if (currentUserChallenge && currentUserChallenge.isPaid) {
    await confirmAlepayPayment(
      data,
      {
        challengesId: challenge.id,
        userChallengeId: currentUserChallenge.id,
      },
      authUser.id,
    );

    return result.send({ message: 'Success', data: true });
  }

  if (isPaymentMomo) {
    const errorMessage = validateMomoData(data.momoData);
    if (errorMessage.length) {
      return result.status(400).send({
        message: errorMessage.join(', '),
      });
    }
  } else {
    const errorMessage = validateALepayData(data.alepayParams);
    if (errorMessage.length) {
      return result.status(400).send({
        message: errorMessage.join(', '),
      });
    }
  }

  const currentDate = new Date();
  const startDate = moment(currentDate)
    .set('date', currentDate.getDate() + 1)
    .set('hours', 0)
    .set('minutes', 0)
    .set('seconds', 0)
    .toDate();
  const endDate = moment(currentDate)
    .set('date', currentDate.getDate() + challenge.totalDate)
    .set('hours', 23)
    .set('minutes', 59)
    .set('seconds', 0)
    .toDate();

  const params: ICreateUserChallengeModels = {
    challengesId: data.challengesId,
    groupId: data.groupId || null,
    isPaid: true,
    startDate: startDate,
    endDate: endDate,
    totalRun: challenge.totalRun,
    userId: authUser.id,
    isCurrentChallenge: true,
    currentGiftReceiving: 0,
    giftBoxesOpened: '',
    createdBy: authUser.id.toString(),
    orderId: orderId,
    status: ChallengeStatus.CreateNew,
    referralCode: data.referralCode,
  };

  let hasPayment = false;

  if (isPaymentMomo) {
    hasPayment = await confirmMomoPayment(data, authUser.id, 'Challenge', {
      challengesId: currentUserChallenge.challengesId,
      userChallengeId: currentUserChallenge.id,
    });
  } else {
    hasPayment = await confirmAlepayPayment(
      data,
      {
        challengesId: currentUserChallenge.challengesId,
        userChallengeId: currentUserChallenge.id,
      },
      authUser.id,
    );
  }

  if (hasPayment) {
    const hasUpdateUserChallenge = await UserChallengenService.update(
      currentUserChallenge.id,
      params,
    );
    if (!hasUpdateUserChallenge) {
      logger.error({ message: 'Confirm payment error', data, authUser });
    }

    //if referralCode then plus point to referral user
    if (data.referralCode) {
      const account = await AccountService.getByReferralCode(data.referralCode);
      if (account) {
        await plusPointToUser(
          5000,
          account.id,
          'Cộng điểm khi giới thiệu người dùng mới!',
        );
        await AccountService.update(authUser.id, {
          hasEnteredReferralCode: true,
        });
      }
    }
    //if token link card
    if (data.alepayParams && data.alepayParams.alepayToken) {
      const {
        alepayToken,
        bankCode,
        bankType,
        cardLinkCode,
        cardNumber,
        method,
      } = data.alepayParams;

      await CardLinkService.create({
        token: alepayToken,
        bankCode: bankCode,
        bankType: bankType,
        cardLinkCode: cardLinkCode,
        cardNumber: cardNumber,
        method: method,
        userId: authUser.id,
      });
    }

    // check challenge has discount
    const discountChallenge = challengePrice(challenge);
    if (discountChallenge.isDiscount) {
      // minus Number Of Discounts
      let updateChallengeData: ICreateChallengesModels = {
        totalNumberOfDiscounts: challenge.totalNumberOfDiscounts - 1,
      };

      //if totalNumberOfDiscounts === 1 then clear discount
      if (challenge.totalNumberOfDiscounts === 1) {
        updateChallengeData = {
          ...updateChallengeData,
          discountPrice: 0,
          starDateDiscount: null,
          endDateDiscount: null,
        };
      }
      // update
      await ChallengeService.update(data.challengesId, updateChallengeData);
    }
    // if discount code
    if (data.discountCode) {
      await deleteDiscount(data.discountCode);
    }

    return result.send({ message: 'Success', data: hasUpdateUserChallenge });
  } else {
    logger.error({ message: 'Confirm payment error', data, authUser });
    result.status(400).send({ message: 'Co loi khi thanh toan' });
  }
};
const confirmMomoPayment = async (
  data: IConfirmUserChallengeReq | IBuyProductsForMoneyReq,
  userId: number,
  paymentType: 'Challenge' | 'Products',
  moreData: {
    challengesId?: number;
    userChallengeId?: number;
    deliveryId?: number;
  },
) => {
  const { momoData } = data;
  let hasPayment = false;

  if (!momoData) {
    return false;
  }

  const pubKey = `-----BEGIN PUBLIC KEY-----${envConfig.PUPLIC_KEY_MOMO}-----END PUBLIC KEY-----`;

  // xu ly thanh toan momo
  const jsonData = {
    amount: momoData.amount,
    partnerRefId: momoData.orderId,
    partnerCode: momoData.partnerCode,
    description:
      paymentType === 'Challenge' ? 'Thanh toan thu thach' : 'Mua san pham',
  };

  const key = new NodeRSA(pubKey, { encryptionScheme: 'pkcs1' });
  const encrypted = key.encrypt(JSON.stringify(jsonData), 'base64');

  const payAppData = {
    partnerCode: momoData.partnerCode,
    partnerRefId: momoData.orderId,
    customerNumber: momoData.phoneNumber,
    appData: momoData.data,
    hash: encrypted,
    version: 2,
    payType: 3,
  };

  let resConfirmData = {};

  const result = await postAsync(
    envConfig.MOMO_BASE_URL,
    'pay/app',
    payAppData,
  );

  if (result && result.data.status === 0) {
    const requestId = generateOrderId();

    const data = `partnerCode=${momoData.partnerCode}&partnerRefId=${momoData.orderId}&requestType=capture&requestId=${requestId}&momoTransId=${result.data.transid}`;

    const hash = createHmac('SHA256', envConfig.MOMO_SECRET_KEY)
      .update(data)
      .digest('hex');

    const resConfirm = await postAsync(
      envConfig.MOMO_BASE_URL,
      '/pay/confirm',
      {
        partnerCode: momoData.partnerCode,
        partnerRefId: momoData.orderId,
        customerNumber: momoData.phoneNumber,
        requestType: 'capture',
        requestId: requestId,
        momoTransId: result.data.transid,
        signature: hash,
      },
    );

    if (resConfirm && resConfirm.data.status === 0) {
      resConfirmData = resConfirm.data;
      hasPayment = true;
    } else {
      const requestId2 = generateOrderId();
      const data2 = `partnerCode=${momoData.partnerCode}&partnerRefId=${momoData.orderId}&requestType=revertAuthorize&requestId=${requestId2}&momoTransId=${result.data.transid}`;
      const hash2 = createHmac('SHA256', envConfig.MOMO_SECRET_KEY)
        .update(data2)
        .digest('hex');

      postAsync(envConfig.MOMO_BASE_URL, '/pay/confirm', {
        partnerCode: momoData.partnerCode,
        partnerRefId: momoData.orderId,
        customerNumber: momoData.phoneNumber,
        requestType: 'revertAuthorize',
        requestId: requestId2,
        momoTransId: result.data.transid,
        signature: hash2,
      });

      hasPayment = false;
    }
  }

  const paymentHistory = await PaymentHistoryService.getByOrderId(data.orderId);

  const description = JSON.stringify({
    payAppData,
    hasPayment,
    resConfirmData,
    requestData: data,
    userId,
    moreData,
  });

  const params: ICreatePaymentHistoriesModels = {
    userId: userId,
    challengesId: moreData.challengesId || null,
    userChallengeId: moreData.userChallengeId || null,
    paidType: PaidType.Momo,
    description: description,
    status: PaidType.Momo,
    orderId: momoData.orderId,
    deliveryId: moreData.deliveryId || null,
    totalPay: data.totalPay,
    total: data.total,
    fee: data.fee,
    discount: data.discount,
  };

  if (!paymentHistory) {
    const res = await PaymentHistoryService.create(params);
    if (!res) {
      logger.error({ message: 'Payment error', data: description });
    }
  } else {
    const res = await PaymentHistoryService.update(paymentHistory.id, params);
    if (!res) {
      logger.error({ message: 'Payment error', data: description });
    }
  }

  return hasPayment;
};
const confirmAlepayPayment = async (
  data: IConfirmUserChallengeReq | IBuyProductsForMoneyReq,
  moreData: {
    challengesId?: number;
    userChallengeId?: number;
    deliveryId?: number;
  },
  userId: number,
) => {
  const { alepayParams } = data;
  let hasPayment = true;

  if (!alepayParams) {
    return false;
  }

  const paymentHistory = await PaymentHistoryService.getByOrderId(data.orderId);

  const description = JSON.stringify({
    hasPayment,
    requestData: data,
    userId,
    moreData,
  });

  const params: ICreatePaymentHistoriesModels = {
    userId: userId,
    challengesId: moreData.challengesId || null,
    userChallengeId: moreData.userChallengeId || null,
    paidType: data.paidType,
    totalPay: data.totalPay,
    description: description,
    status: data.paidType,
    orderId: alepayParams.orderCode,
    deliveryId: moreData.deliveryId || null,
    fee: alepayParams.merchantFee,
    total: data.total,
    discount: data.discount,
  };
  if (!paymentHistory) {
    const res = await PaymentHistoryService.create(params);
    if (!res) {
      logger.error({ message: 'Payment error', data: description });
    }
  } else {
    const res = await PaymentHistoryService.update(paymentHistory.id, params);
    if (!res) {
      logger.error({ message: 'Payment error', data: description });
    }
  }

  return hasPayment;
};
//#endregion challenges

//#region  products
const createPaymentProduct = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const body = request.body;
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const data: IBuyProductsReq = HybridCryptoHash.decryption(body.data);
  if (!data) {
    return result
      .status(400)
      .send({ message: 'Dữ liệu thanh toán không đúng!' });
  }

  const errorMessage = validateBuyProductsData(data);
  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }
  const totalPointProduct = await getTotalPointsProducts(data.products);
  if (totalPointProduct.hasNotProduct) {
    return result.status(400).send({
      message: 'Sản phẩm không có trong dữ liệu',
    });
  }

  const isPaidPoint = data.paidType === PaidType.Points;
  const isPaidCash = data.paidType === PaidType.Cash;

  const userPoints = await PointService.getByUserId(authUser.id);
  if (
    isPaidPoint &&
    (userPoints.point < data.totalPay ||
      userPoints.point < totalPointProduct.totalPointProduct)
  ) {
    return result.status(400).send({
      message: 'Số điểm không đủ để đổi quà',
    });
  }

  const orderId = data.orderId;

  const params: ICreateDeliveryModels = {
    userId: authUser.id,
    deliveryAddress: data.deliveryAddress,
    phoneNumber: data.phoneNumber,
    totalPay: data.totalPay,
    shippingStatus:
      isPaidPoint || isPaidCash ? ShippingStatus.Cash : ShippingStatus.Create,
    email: data.email,
    fullName: data.fullName,
    createdBy: authUser.id.toString(),
    paidType: data.paidType,
    orderId: orderId,
    description: isPaidPoint
      ? JSON.stringify({
          data,
          userId: authUser.id,
          cashType: data.paidType,
        })
      : '',
    provinceCode: data.provinceCode,
    districtCode: data.districtCode,
    wardsCode: data.wardsCode,
    total: data.total,
    discount: data.discount,
    fee: data.fee,
  };

  const newDelivery = await DeliveryService.create(params);

  if (!newDelivery) {
    return result.status(500).send(new ReporingError().toModel());
  }

  const productsData = data.products.map((product) => {
    return {
      deliveryId: newDelivery.id,
      quantity: product.quantity,
      productId: product.productId,
      size: product.size,
      createdBy: authUser.id.toString(),
    } as ICreateDeliveryProductModels;
  });

  const deliveryProducts = await DeliveryProductService.createList(
    productsData,
  );

  const deliveryData = { deliveryData: newDelivery, deliveryProducts };

  let hasPayment = true;

  if (isPaidPoint) {
    hasPayment = await handleMinusPoints(
      data.totalPay,
      authUser.id,
      newDelivery.id,
    );
  }
  if (isPaidPoint || isPaidCash) {
    const params: ICreatePaymentHistoriesModels = {
      userId: authUser.id,
      challengesId: null,
      userChallengeId: null,
      paidType: data.paidType,
      totalPay: data.totalPay,
      description: JSON.stringify({
        hasPayment: hasPayment,
        requestData: data,
        userId: authUser.id,
        moreData: {},
      }),
      status: data.paidType,
      orderId: data.orderId,
      deliveryId: newDelivery.id,
      total: data.total,
      discount: data.discount,
      fee: data.fee,
    };
    await PaymentHistoryService.create(params);
  }

  if (hasPayment)
    return result.send({ message: 'Success', data: deliveryData });
  else {
    await DeliveryService.delete(newDelivery.id);

    await DeliveryProductService.deleteAsync(
      deliveryProducts.map((item) => item.id),
    );

    result.status(400).send({ message: 'Co loi khi thanh toan' });
  }
};
const confirmPaymentProduct = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const body = request.body;
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const data: IBuyProductsForMoneyReq = HybridCryptoHash.decryption(body.data);
  if (!data) {
    return result
      .status(400)
      .send({ message: 'Dữ liệu thanh toán không đúng!' });
  }

  await addDataPaymentProducts(result, data, authUser.id);
};
const addDataPaymentProducts = async (
  result: Response,
  data: IBuyProductsForMoneyReq,
  userId: number,
) => {
  const orderId =
    data.paidType === PaidType.Momo
      ? data.momoData.orderId
      : data.alepayParams.orderCode;

  const delivery = await DeliveryService.getByOrderId(orderId);
  if (!delivery) {
    return result.status(400).send({
      message: 'Mã đơn hàng không đúng!',
    });
  }
  if (delivery && delivery.shippingStatus === ShippingStatus.Cash) {
    result.send({ message: 'Success' });
  }

  const errorMessage = validateBuyProductsData(data);
  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const isAlepay =
    data.paidType === PaidType.ATM ||
    data.paidType === PaidType.InternationalCard;

  const params: ICreateDeliveryModels = {
    userId: userId,
    deliveryAddress: data.deliveryAddress,
    phoneNumber: data.phoneNumber,
    totalPay: data.totalPay,
    shippingStatus: ShippingStatus.Cash,
    email: data.email,
    fullName: data.fullName,
    createdBy: userId.toString(),
    paidType: data.paidType,
    orderId: orderId,
    description: JSON.stringify({ data, userId, cashType: data.paidType }),
    provinceCode: data.provinceCode,
    districtCode: data.districtCode,
    wardsCode: data.wardsCode,
    fee: isAlepay ? data.alepayParams.merchantFee : 0,
    total: data.total,
    discount: data.discount,
  };

  const hasUpdateDelivery = await DeliveryService.update(delivery.id, params);

  if (!hasUpdateDelivery) {
    return result.status(500).send(new ReporingError().toModel());
  }

  let hasPayment = false;

  if (data.paidType === PaidType.Momo) {
    hasPayment = await confirmMomoPayment(data, userId, 'Products', {
      deliveryId: delivery.id,
    });
  }
  if (
    data.paidType === PaidType.InternationalCard ||
    data.paidType === PaidType.ATM
  ) {
    hasPayment = await confirmAlepayPayment(
      data,
      {
        deliveryId: delivery.id,
      },
      userId,
    );
  }

  if (hasPayment) {
    // if discount code
    if (data.discountCode) {
      await deleteDiscount(data.discountCode);
    }
    //if token link card
    if (data.alepayParams && data.alepayParams.alepayToken) {
      const {
        alepayToken,
        bankCode,
        bankType,
        cardLinkCode,
        cardNumber,
        method,
      } = data.alepayParams;

      await CardLinkService.create({
        token: alepayToken,
        bankCode: bankCode,
        bankType: bankType,
        cardLinkCode: cardLinkCode,
        cardNumber: cardNumber,
        method: method,
        userId: userId,
      });
    }

    return result.send({ message: 'Success' });
  } else {
    result.status(400).send({ message: 'Co loi khi thanh toan' });
  }
};
const handleMinusPoints = async (
  totalPay: number,
  userId: number,
  deliveryId: number,
) => {
  const res = await PointService.getByUserId(userId);

  const points = res.point - totalPay;

  const hasUpdate = await PointService.update(userId, { point: points });

  if (!hasUpdate) {
    logger.error({
      message: 'Error when minus points',
      userId,
      totalPay,
    });

    return false;
  } else {
    const params: ICreatePointsHistoriesModels = {
      deliveryId: deliveryId,
      description: 'Trừ điểm thanh toán mua sản phẩm',
      point: points,
      price: 0,
      createdBy: userId.toString(),
    };

    await PointHistoryService.create(params);

    return true;
  }
};
//#endregion products

const getPaymentHistories = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const query: any = request.query;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const histories = await PaymentHistoryService.getBySearchParams(query);

  const resData = histories.items.map((item) =>
    HybridCryptoHash.encryption(item),
  );

  return result.send({ ...histories, items: resData });
};

const reportPayments = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const query: any = request.query;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const histories = await PaymentHistoryService.getByReportParams(query);
  const columns = [
    { header: 'Mã giao dịch', key: 'orderId', width: 20 },
    { header: 'Mã người dùng', key: 'userId', width: 20 },
    { header: 'Mã thử thách', key: 'challengesId', width: 20 },
    { header: 'Loại thanh toán', key: 'paidType', width: 20 },
    { header: 'Tổng điểm', key: 'totalPoint', width: 15 },
    { header: 'Tổng tiền', key: 'totalPrice', width: 15 },
    { header: 'Ngày thanh toán', key: 'createdAt', width: 20 },
    { header: 'Mã giao hàng', key: 'deliveryId', width: 20 },
    // { header: 'description', key: 'description', width: 20 },
  ];

  // Looping through User data
  const data = histories.items.map((item) => {
    return {
      ...item,
      createdAt: item.createdAt
        ? moment(item.createdAt).format('YYYY/MM/DD')
        : '',
    };
  });

  try {
    const bufferFile = await exportExcel(columns, data);

    result.send(bufferFile);
  } catch (err) {
    result.send({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const getDetailPaymentHistory = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const paymentId = Number(request.params.id);

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const payment = await PaymentHistoryService.getById(paymentId);

  if (!payment) {
    return result
      .status(400)
      .send({ message: 'Không tìm thấy giao dịch này!' });
  }

  let moreData: IMoreDataPayment = {
    challengeName: '',
    dataPayment: payment.description,
    description: '',
    email: '',
    fullName: '',
    phoneNumber: '',
  };

  const user = await UserService.getByAccountId(payment.userId);

  if (user) {
    moreData.fullName = `${user.lastName ?? ''} ${user.firstName ?? ''}`;
    moreData.email = user.email;
    moreData.phoneNumber = user.phoneNumber;
  }

  const challenge = await ChallengeService.getById(payment.challengesId);
  if (challenge) {
    moreData.challengeName = challenge.name;
  }
  const delivery = await DeliveryService.getById(payment.deliveryId);
  if (delivery) {
    moreData.dataPayment = delivery.description;
  }

  return result.send({
    data: HybridCryptoHash.encryption(
      PaymentHistoryService.toDetailModel(payment, moreData),
    ),
  });
};
// confirm payment for alepay with challenge and products
const savePaymentForAlepay = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: { check_key: string; data: string } = request.body;

  if (data.check_key !== envConfig.MIKO_CHECK_KEY_MD5) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  if (!data.data)
    return result.status(400).send({ message: 'Data is required' });

  const decodeData = Buffer.from(data.data, 'base64').toString();

  const alepayData: AlepayRes = JSON.parse(decodeData);

  const currentUserChallenge = await UserChallengenService.getByOrderId(
    alepayData.orderCode,
  );
  const delivery = await DeliveryService.getByOrderId(alepayData.orderCode);

  if (!currentUserChallenge && !delivery) {
    // save error
    logger.error({ message: 'Confirm payment error!', data: data });
  } else if (currentUserChallenge) {
    const challenge = await ChallengeService.getById(
      currentUserChallenge.challengesId,
    );
    if (!challenge) {
      logger.error({ ...data, message: 'Challenge not found' });
      return result.status(400).send({ message: 'Invalid challenge id' });
    }

    // if user challenge is confirm
    if (currentUserChallenge && currentUserChallenge.isPaid) {
      return result.send({ message: 'Success', data: true });
    }

    const errorMessage = validateALepayData(alepayData);
    if (errorMessage.length) {
      return result.status(400).send({
        message: errorMessage.join(', '),
      });
    }

    const currentDate = new Date();
    const startDate = moment(currentDate)
      .set('date', currentDate.getDate() + 1)
      .format('YYYY-MM-DD');
    const endDate = moment(currentDate)
      .set('date', currentDate.getDate() + challenge.totalDate)
      .format('YYYY-MM-DD');

    const params: ICreateUserChallengeModels = {
      challengesId: currentUserChallenge.challengesId,
      groupId: currentUserChallenge.groupId || null,
      isPaid: true,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalRun: challenge.totalRun,
      userId: currentUserChallenge.userId,
      isCurrentChallenge: true,
      currentGiftReceiving: 0,
      giftBoxesOpened: '',
      createdBy: currentUserChallenge.userId.toString(),
      orderId: alepayData.orderCode,
      paidType: currentUserChallenge.paidType,
      status: ChallengeStatus.CreateNew,
      referralCode: currentUserChallenge.referralCode,
    };

    const dataPayment: IConfirmUserChallengeReq = {
      challengesId: currentUserChallenge.challengesId,
      groupId: currentUserChallenge.groupId,
      paidType: currentUserChallenge.paidType,
      alepayParams: alepayData,
      total: alepayData.amount - alepayData.merchantFee,
      totalPay: alepayData.amount,
      discount: 0,
      fee: alepayData.merchantFee,
      orderId: alepayData.orderCode,
    };

    await confirmAlepayPayment(
      dataPayment,
      {
        challengesId: currentUserChallenge.challengesId,
        userChallengeId: currentUserChallenge.id,
      },
      currentUserChallenge.userId,
    );

    const hasUpdateUserChallenge = await UserChallengenService.update(
      currentUserChallenge.id,
      params,
    );
    if (!hasUpdateUserChallenge) {
      logger.error({
        message: 'Confirm payment error',
        data,
        currentUserChallenge,
      });
    }
  } else {
    if (delivery && delivery.shippingStatus === ShippingStatus.Cash) {
      result.send({ message: 'Success' });
    }

    // save payment for product
    const params: ICreateDeliveryModels = {
      userId: delivery.userId,
      deliveryAddress: delivery.deliveryAddress,
      phoneNumber: delivery.phoneNumber,
      totalPay: delivery.totalPay,
      shippingStatus: ShippingStatus.Cash,
      email: delivery.email,
      fullName: delivery.fullName,
      createdBy: delivery.userId.toString(),
      paidType: delivery.paidType,
      orderId: alepayData.orderCode,
      description: JSON.stringify({
        ...JSON.parse(delivery.description),
        confirmDataAlepay: data,
      }),
      provinceCode: delivery.provinceCode,
      districtCode: delivery.districtCode,
      wardsCode: delivery.wardsCode,
      fee: alepayData.merchantFee,
      total: delivery.total,
      discount: delivery.discount,
    };

    const res = await DeliveryService.update(delivery.id, params);

    const dataPayment: IBuyProductsForMoneyReq = {
      paidType: delivery.paidType,
      alepayParams: alepayData,
      total: delivery.total,
      totalPay: delivery.totalPay,
      discount: delivery.discount,
      fee: delivery.fee,
      deliveryAddress: delivery.deliveryAddress,
      description: delivery.description,
      districtCode: delivery.districtCode,
      email: delivery.email,
      fullName: delivery.fullName,
      orderId: delivery.orderId,
      phoneNumber: delivery.phoneNumber,
      provinceCode: delivery.provinceCode,
      wardsCode: delivery.wardsCode,
      products: delivery.products.map((item) => {
        return {
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          cashType:
            delivery.paidType === PaidType.Points
              ? CashType.Points
              : CashType.Prices,
        };
      }),
    };

    await confirmAlepayPayment(
      dataPayment,
      {
        deliveryId: delivery.id,
      },
      currentUserChallenge.userId,
    );

    if (!res) {
      return result.status(500).send(new ReporingError().toModel());
    }
  }
  return result.send({ message: 'Success' });
};

// get card link
const getCardLinks = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const cards = await CardLinkService.getByUserId(authUser.id);

  return result.send(cards.map((card) => CardLinkService.toModel(card)));
};
// get card link
const deleteCardLinks = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const token = request.params.token;

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const card = await CardLinkService.getByToken(token);

  if (!card) {
    return result.status(400).send({ message: 'Mã không đúng!' });
  }

  const hasDelete = await deleteTokenALepay(token);

  if (!hasDelete) {
    return result.status(400).send({
      message: 'Huỷ liên kết không thành công. Vui lòng thử lại sau!',
    });
  }

  await CardLinkService.delete(card.id);

  return result.send(hasDelete);
};

//#region  more handle
const getTotalPointsProducts = async (
  products: {
    productId: number;
    quantity: number;
    cashType: CashType;
    size: string;
  }[],
) => {
  let totalPointProduct = 0;
  let hasNotProduct = false;

  const res = await ProductService.getByIds(
    products.map((item) => item.productId),
  );

  products.forEach((product) => {
    if (!res.some((item) => item.id === product.productId)) {
      hasNotProduct = true;
    } else {
      const data = res.find((item) => item.id === product.productId);

      totalPointProduct += data.pointsPrice * product.quantity;
    }
  });

  return { totalPointProduct, hasNotProduct };
};
const validateMomoData = (data: MomoPaymentReq) => {
  const errorDatas = {
    partnerCode: 'PartnerCode is required',
    orderId: 'OrderId is required',
    phoneNumber: 'CustomerNumber is required',
    data: 'AppData is required',
    amount: 'Amount is required',
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  return message;
};
const validateALepayData = (data: AlepayRes) => {
  const errorDatas = {
    orderCode: 'orderCode is required',
    amount: 'Amount is required',
    transactionCode: 'TransactionCode is required',
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  return message;
};
const validateBuyProductsData = (data: IBuyProductsReq) => {
  const errorDatas = {
    phoneNumber: 'PhoneNumber is required',
    deliveryAddress: 'Deliveryaddress is required',
    totalPay: 'totalPay is required',
    fullName: 'FullName is required',
    orderId: 'OrderId is required',
    paidType: 'PaidType is required',
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });
  if (!data.provinceCode) {
    message.push('Invalid provinceCode');
  }
  if (!data.districtCode) {
    message.push('Invalid districtCode');
  }
  if (!data.wardsCode) {
    message.push('Invalid wardsId');
  }

  if (!data.products.length) {
    message.push('Products is empty');
  }
  if (
    data.products.length &&
    data.products.some((d) => !d.productId || !d.quantity || !d.cashType)
  ) {
    message.push('Products data is not valid');
  }

  return message;
};
// check challenge has discount with date
const checkHasDiscountChallenge = (item: IChallengesModels) => {
  const thisDate = new Date();

  if (item.starDateDiscount && item.endDateDiscount) {
    if (
      new Date(item.starDateDiscount) < thisDate &&
      new Date(item.endDateDiscount) >= thisDate
    ) {
      return true;
    }
  } else {
    return false;
  }
};
// check challenge has discount
const challengePrice = (item: IChallengesModels) => {
  const hasDiscount = checkHasDiscountChallenge(item);

  if (hasDiscount) {
    return { price: item.discountPrice, isDiscount: true };
  }

  return { price: item.price, isDiscount: false };
};
//delete discount
const deleteDiscount = async (discountCode: string) => {
  const discount = await UserDiscountCodeService.getByCode(discountCode);

  if (discount) {
    if (discount.numberOfUses > 1) {
      await UserDiscountCodeService.update(discount.id, {
        numberOfUses: discount.numberOfUses - 1,
      });
    } else {
      await UserDiscountCodeService.delete(discount.id);
    }
  }
};
// delete token
const deleteTokenALepay = async (token: string): Promise<boolean> => {
  const { MIKO_BASE_URL, MIKO_CHECK_KEY_MD5 } = envConfig;

  const res = await getAsync(MIKO_BASE_URL, 'cancle_tokenization.php', {
    check_key: MIKO_CHECK_KEY_MD5,
    alepayToken: token,
  });
  console.log('cancle_tokenization', res.data);
  console.log('type', typeof res.data);

  if (res && res.data && typeof res.data === 'string') {
    console.log('type', JSON.parse(res.data));

    return true;
  }
  if (
    res &&
    res.data &&
    (res.data.errorCode === '000' || res.data.errorCode === '108')
  )
    return true;

  return false;
};
//#endregion more handle

export default {
  createPaymentChallenge,
  confirmPaymentChallenge,
  createPaymentProduct,
  confirmPaymentProduct,
  getPaymentHistories,
  savePaymentForAlepay,
  getDetailPaymentHistory,
  reportPayments,
  getCardLinks,
  deleteCardLinks,
};
