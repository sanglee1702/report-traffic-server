import { Roles } from './../models/common/models.enum';
import { Request, Response } from 'express';
import { checkAuthentication } from '../helpers/authentication.helpers';
import { ShippingStatus } from '../models/common/models.enum';
import DeliveryService from '../services/delivery.service';
import { UnauthorizedError } from '../utils/error';
import { ICreateDeliveryModels } from '../models/delivery.models';
import ProductService from '../services/product.service';
import ProvinceService from '../services/province.service';
import DistrictService from '../services/district.service';
import WardService from '../services/ward.service';
import HybridCryptoHash from '../utils/hybrid-crypto-hash';

const getDeliveries = async (
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

  const deliveries = await DeliveryService.getBySearchParams(query);

  const resData = deliveries.items.map((item) =>
    HybridCryptoHash.encryption(item),
  );

  return result.send({ ...deliveries, items: resData });
};

const getDelivery = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const deliveryId = Number(request.params.id);

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const delivery = await DeliveryService.getById(deliveryId);

  let address = {
    province: '',
    district: '',
    ward: '',
  };

  const province = await ProvinceService.getByCode(delivery.provinceCode);
  if (province) {
    address.province = province.name;
  }
  const district = await DistrictService.getByCode(delivery.districtCode);
  if (district) {
    address.district = district.name;
  }
  const ward = await WardService.getByCode(delivery.wardsCode);
  if (ward) {
    address.ward = ward.name;
  }

  if (!delivery)
    return result
      .status(400)
      .send({ message: 'Không tìm thấy lịch sử chuyền hàng này!' });

  const productsRes = await ProductService.getByIds(
    delivery.products.map((item) => item.productId),
  );

  const products = productsRes.map((product) => {
    const deliveryProduct = delivery.products.find(
      (item) => item.productId === product.id,
    );

    return {
      ...product,
      quantity: deliveryProduct?.quantity,
      size: deliveryProduct?.size,
    };
  });

  return result.send({
    data: HybridCryptoHash.encryption({
      ...delivery,
      products: products,
      province: address.province,
      district: address.district,
      ward: address.ward,
    }),
  });
};

const updateShippingStatus = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const deliveryId = Number(request.params.id);
  const data: { shippingStatus: ShippingStatus } = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.Admin,
    Roles.SuperAdmin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const matchStatus = Object.values(ShippingStatus).includes(
    data.shippingStatus,
  );

  if (!matchStatus) {
    return result
      .status(400)
      .send({ message: 'Trạng thái giao hàng không đúng' });
  }

  const delivery = await DeliveryService.getById(deliveryId);
  if (!delivery) {
    return result
      .status(400)
      .send({ message: 'Không tìm thấy lịch sử giao hàng' });
  }

  const deliveries = await DeliveryService.update(deliveryId, {
    shippingStatus: data.shippingStatus,
  });

  return result.send(deliveries);
};

const updateDelivery = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const id = Number(request.params.id);
  const data: ICreateDeliveryModels = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.Admin,
    Roles.SuperAdmin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const delivery = await DeliveryService.getById(id);
  if (!delivery) {
    return result.status(400).send({ message: 'Delivery not found' });
  }

  const updataData: ICreateDeliveryModels = {};
  if (data.deliveryAddress) updataData.deliveryAddress = data.deliveryAddress;
  if (data.email) updataData.deliveryAddress = data.deliveryAddress;
  if (data.fullName) updataData.deliveryAddress = data.deliveryAddress;
  if (data.phoneNumber) updataData.deliveryAddress = data.deliveryAddress;
  if (data.districtCode) updataData.deliveryAddress = data.deliveryAddress;
  if (data.provinceCode) updataData.deliveryAddress = data.deliveryAddress;
  if (data.wardsCode) updataData.deliveryAddress = data.deliveryAddress;
  if (data.total) updataData.total = data.total;
  if (data.totalPay) updataData.totalPay = data.totalPay;
  if (data.discount) updataData.discount = data.discount;
  if (data.fee) updataData.fee = data.fee;

  const deliveries = await DeliveryService.update(id, updataData);

  return result.send(deliveries);
};

const getDeliveriesByUser = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const query: any = request.query;

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const params = { ...query, userId: authUser.id };

  const res = await DeliveryService.getByUser(params);

  let deliveries = [];

  for (const delivery of res.items) {
    const productsRes = await ProductService.getByIds(
      delivery.products.map((item) => item.productId),
    );

    const products = productsRes.map((product) => {
      const deliveryProduct = delivery.products.find(
        (item) => item.productId === product.id,
      );

      return {
        ...product,
        quantity: deliveryProduct?.quantity,
        size: deliveryProduct?.size,
      };
    });

    let address = {
      province: '',
      district: '',
      ward: '',
    };

    const province = await ProvinceService.getByCode(delivery.provinceCode);
    if (province) {
      address.province = province.name;
    }
    const district = await DistrictService.getByCode(delivery.districtCode);
    if (district) {
      address.district = district.name;
    }
    const ward = await WardService.getByCode(delivery.wardsCode);
    if (ward) {
      address.ward = ward.name;
    }

    deliveries.push({
      ...delivery,
      products,
      province: address.province,
      district: address.district,
      ward: address.ward,
    });
  }

  return result.send({ ...res, items: deliveries });
};
const getDeliveryByUser = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const deliveryId = Number(request.params.id);

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const delivery = await DeliveryService.getById(deliveryId);

  if (authUser.id !== delivery.userId) {
    return result
      .status(400)
      .send({ message: 'Không tìm thấy lịch sử giao hàng!' });
  }
  let address = {
    province: '',
    district: '',
    ward: '',
  };

  const province = await ProvinceService.getByCode(delivery.provinceCode);
  if (province) {
    address.province = province.name;
  }
  const district = await DistrictService.getByCode(delivery.districtCode);
  if (district) {
    address.district = district.name;
  }
  const ward = await WardService.getByCode(delivery.wardsCode);
  if (ward) {
    address.ward = ward.name;
  }

  if (!delivery)
    return result
      .status(400)
      .send({ message: 'Không tìm thấy lịch sử chuyền hàng này!' });

  const productsRes = await ProductService.getByIds(
    delivery.products.map((item) => item.productId),
  );

  const products = productsRes.map((product) => {
    const deliveryProduct = delivery.products.find(
      (item) => item.productId === product.id,
    );

    return {
      ...product,
      quantity: deliveryProduct?.quantity,
      size: deliveryProduct?.size,
    };
  });

  return result.send({
    ...delivery,
    products: products,
    province: address.province,
    district: address.district,
    ward: address.ward,
  });
};

export default {
  getDeliveries,
  getDelivery,
  updateShippingStatus,
  updateDelivery,
  getDeliveriesByUser,
  getDeliveryByUser,
};
