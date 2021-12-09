import { ObjectStatus, OrderDirection } from './models.enum';

export interface IBaseModels {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  objectStatus?: ObjectStatus;
}

export interface BasePagingReq {
  page?: number;
  pageSize?: number;
  sortNames?: string[];
  sortDirections?: OrderDirection[];
  allItems?: boolean;
  status?: ObjectStatus;
  keyword?: string;
}

export interface BasePagingRes<T> {
  items: T[];
  page?: number;
  pageSize?: number;
  total: number;
}

export interface MomoPaymentReq {
  appSource: string;
  message: string;
  requestId: string;
  orderId: string;
  extra: string;
  phoneNumber: string;
  status: number;
  data: string;
  momoappversion: string;
  fromapp: string;
  amount: number;
  partnerCode: string;
}

export interface AlepayRes {
  amount: number;
  bankCode: string;
  bankHotline: string;
  bankName: string;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
  cardNumber: string;
  currency: string;
  exchangeRate: number;
  installment: boolean;
  is3D: boolean;
  merchantFee: number;
  message: string;
  method: string;
  month: number;
  orderCode: string;
  payerFee: number;
  requestAmount: number;
  requestCurrency: string;
  status: string;
  successTime: number;
  transactionCode: string;
  transactionTime: number;
  withdrawn: boolean;
  // data one-click payment
  alepayToken: string;
  bankType: string;
  cardLinkCode: string;
}

export interface IConfigAPP {
  noReadNotificationsNumber: number;
}
