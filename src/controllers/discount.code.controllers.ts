import { Request, Response } from 'express';
import { envConfig } from '../config/env.config';
import { generateCode } from '../helpers';
import { checkAuthentication } from '../helpers/authentication.helpers';
import { ObjectStatus, Roles } from '../models/common/models.enum';
import {
  DiscountType,
  ICreateDiscountCodeModels,
} from '../models/discount.code.models';
import DiscountCodeService from '../services/discount.code.service';
import UserDiscountCodeService, {
  IUserDiscountCodeRes,
} from '../services/user.discount.code.service';
import { ReporingError, UnauthorizedError } from '../utils/error';

const gets = async (request: Request, result: Response) => {
  const query: any = request.query;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const giftboxs = await DiscountCodeService.getList(query);

  return result.send(giftboxs);
};
const create = async (request: Request, result: Response) => {
  const data: ICreateDiscountCodeModels = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errMessage = await validateGiftboxData(data);
  if (errMessage.length) {
    return result.status(400).send({ message: errMessage.join(', ') });
  }

  const params: ICreateDiscountCodeModels = {
    name: data.name || null,
    description: data.description || null,
    code: data.code,
    createdBy: authUser.id.toString(),
    expireDate: data.expireDate || null,
    numberOfUses: data.numberOfUses ?? 1,
    discountAmount: data.discountAmount || null,
    maximumDiscountAmount: data.maximumDiscountAmount || null,
    percentDiscount: data.percentDiscount || null,
    type: data.type,
    avatarUrl: data.avatarUrl,
    brandName: data.brandName,
    brandThumbUrl: data.brandThumbUrl,
    brandUrl: data.brandUrl,
    thumbUrl: data.thumbUrl,
  };

  const giftBox = await DiscountCodeService.create(params);

  if (!giftBox) return result.status(500).send(new ReporingError().toModel());

  return result.send(DiscountCodeService.toModel(giftBox));
};
const update = async (request: Request, result: Response) => {
  const id = Number(request.params.id);
  const data: ICreateDiscountCodeModels & { status: ObjectStatus } =
    request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const giftBox = await DiscountCodeService.getById(id);
  if (!giftBox) return result.status(400).send({ message: 'Không tìm thấy!' });

  const errMessage = await validateGiftboxData(data, id);
  if (errMessage.length) {
    return result.status(400).send({ message: errMessage.join(', ') });
  }

  const params: ICreateDiscountCodeModels = {
    avatarUrl: data.avatarUrl || null,
    name: data.name,
    description: data.description || null,
    code: data.code,
    objectStatus: data.status,
    updatedBy: authUser.id.toString(),
    expireDate: data.expireDate || null,
    numberOfUses: data.numberOfUses ?? 1,
    discountAmount: data.discountAmount || null,
    maximumDiscountAmount: data.maximumDiscountAmount || null,
    percentDiscount: data.percentDiscount || null,
    type: data.type,
    brandName: data.brandName,
    brandThumbUrl: data.brandThumbUrl,
    brandUrl: data.brandUrl,
    thumbUrl: data.thumbUrl,
  };

  const hasUpdate = await DiscountCodeService.update(id, params);

  if (!hasUpdate) return result.status(500).send(new ReporingError().toModel());

  return result.send({ message: 'Success' });
};
const deleteAsync = async (request: Request, result: Response) => {
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const id = Number(request.params.id);

  const category = await DiscountCodeService.delete(id);

  if (!category) return result.status(400).send({ message: 'Không thể xoá' });

  return result.send({ message: 'Đã xoá' });
};
const hasUseThisDiscountCode = async (request: Request, result: Response) => {
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const discountCode = request.params.discountCode;
  const data: { id: number } = request.body;

  const hasUse = await checkDiscountCode(discountCode, data.id);

  return result.send(hasUse);
};

const getDetailCodeByUser = async (request: Request, result: Response) => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const code = request.params.code;

  const discount = await UserDiscountCodeService.getByCode(code);

  if (!discount) {
    return result.status(400).send({ message: 'Không tìm thấy mã giảm giá!' });
  }

  return result.send(discount);
};
const getDetailById = async (request: Request, result: Response) => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const id = Number(request.params.id);

  const discount = await DiscountCodeService.getById(id);

  if (!discount) {
    return result.status(400).send({ message: 'Không tìm thấy mã giảm giá!' });
  }

  return result.send(discount);
};

const generateDiscountCode = async (request: Request, result: Response) => {
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const discountCode = await generateDiscountCodeWithCheck();

  return result.send(discountCode);
};

const checkDiscountCodeHasUse = async (request: Request, result: Response) => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const code = request.params.code;
  const data: { type: DiscountType } = request.body;

  const discount = await UserDiscountCodeService.getByCode(code);

  let message = '';
  if (!discount) {
    message = 'Mã giảm giá không tồn tại!';
  }
  if (discount && discount.status === ObjectStatus.DeActive) {
    message = 'Mã giảm giá đã được sử dụng!';
  }
  if (
    discount &&
    discount.type !== DiscountType.Challenge &&
    !checkExpireDateCode(discount)
  ) {
    message = 'Mã giảm giá đã hết hạn!';
  }
  if (discount && discount.type !== data.type) {
    message = 'Mã giảm giá không đúng loại!';
  }

  if (message) {
    return result.status(400).send({ message });
  }

  return result.send(true);
};

const checkExpireDateCode = (discount: IUserDiscountCodeRes): boolean => {
  const thisDate = new Date();
  const expireDate = new Date(discount.expireDate);

  if (thisDate > expireDate) {
    return false;
  }

  return true;
};

const generateDiscountCodeWithCheck = async (): Promise<string> => {
  const id = generateCode(6).toUpperCase();
  let discountCode = `${envConfig.START_OF_DISCOUNT_CODE}${id}`;

  if (!(await checkDiscountCode(discountCode))) {
    return await generateDiscountCodeWithCheck();
  }

  return discountCode;
};

const checkDiscountCode = async (discountCode: string, id?: number) => {
  const code = discountCode.toLowerCase();

  const discount = await DiscountCodeService.getByCode(code);
  const discountForUser = await UserDiscountCodeService.getByCode(code);

  if (!id && (discount || discountForUser)) {
    return false;
  }
  if (
    !!id &&
    ((discount && discount.id !== id) ||
      (discountForUser && discountForUser.code.toLowerCase() === code))
  ) {
    return false;
  }

  return true;
};

const validateGiftboxData = async (
  data: ICreateDiscountCodeModels,
  id?: number,
): Promise<string[]> => {
  const errorDatas = {
    name: 'Tên bắt buộc nhập',
    code: 'Mã bắt buộc nhập',
    expireDate: 'Ngày hết hạn bắt buộc nhập',
    type: 'Loại bắt buộc nhập',
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  const hasUse = await checkDiscountCode(data.code, id);

  if (!hasUse) {
    message.push('Mã đã được sử dụng!');
  }

  return message;
};

export default {
  gets,
  create,
  update,
  deleteAsync,
  hasUseThisDiscountCode,
  generateDiscountCode,
  checkDiscountCodeHasUse,
  getDetailCodeByUser,
  getDetailById,
};
