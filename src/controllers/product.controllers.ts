import { Request, Response } from 'express';
import { checkContentContainingAbsolutePath, hasEmail } from '../helpers';
import { checkAuthentication } from '../helpers/authentication.helpers';
import {
  ObjectStatus,
  OrderDirection,
  Roles,
} from '../models/common/models.enum';
import { ICreateProductCategoryModels } from '../models/product.category.models';
import { ICreateProductCommentModels } from '../models/product.comment.models';
import { ICreateMainCategoryModels } from '../models/product.main.category.models';
import { ICreateProductModels } from '../models/product.models';
import ProductCategoryService from '../services/product.category.service';
import ProductCommentService, {
  IGetProductCommnetReq,
} from '../services/product.comment.service';
import ProductMainCategoryService from '../services/product.main.category.service';
import ProductService, { IGetProductReq } from '../services/product.service';
import WishlistService from '../services/wishlist.service';
import { ReporingError, UnauthorizedError } from '../utils/error';

export interface ICreateProductCommentReq {
  productId: number;
  nameUserComment: string;
  email: string;
  star: number;
  title: string;
  comment: string;
}

export interface ICreateMainCategoryReq {
  name: string;
  avatarUrl: string;
  code: string;
}

export interface ICreateProductReq {
  name: string;
  code: string;
  categoryId: number;
  cashPrice: number;
  pointsPrice: number;
  description: string;
  saleOff: number;
  size: string[];
  quantity: number;
  thumb: string;
  avatarUrl: string[];
  content: string;
  status?: ObjectStatus;
}

const getAllProductMainCategory = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const query = request.query;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);

  const category = await ProductMainCategoryService.getList(query, !!authUser);

  return result.send(category);
};

const createProductMainCategory = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateMainCategoryReq = request.body;
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage: string[] = [];
  if (!data.name) {
    errorMessage.push('Name is required');
  }

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateMainCategoryModels = {
    code: data.code,
    name: data.name,
    avatarUrl: data.avatarUrl,
    createdBy: authUser.id.toString(),
  };

  const mainCategory = await ProductMainCategoryService.create(params);

  if (!mainCategory)
    return result.status(500).send(new ReporingError().toModel());

  return result.send(ProductMainCategoryService.toModel(mainCategory));
};

const updateProductMainCategory = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateMainCategoryReq & { id: number; status: ObjectStatus } =
    request.body;
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage: string[] = [];
  if (!data.id) {
    errorMessage.push('Id is required');
  }
  if (!data.name) {
    errorMessage.push('Name is required');
  }

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateMainCategoryModels = {
    code: data.code,
    name: data.name,
    avatarUrl: data.avatarUrl,
    updatedBy: authUser.id.toString(),
    objectStatus: data.status,
  };

  const mainCategory = await ProductMainCategoryService.update(data.id, params);
  if (!mainCategory)
    return result.status(500).send(new ReporingError().toModel());

  return result.send({ message: 'Success' });
};

const deleteProductMainCategory = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const productMainId = Number(request.params.id);

  const hasDelete = await ProductMainCategoryService.delete(productMainId);

  if (!hasDelete) return result.status(400).send({ message: 'Không thể xoá' });

  return result.send({ message: 'Success' });
};

const getAllProductCategory = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const query = request.query;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);

  const category = await ProductCategoryService.getList(
    query as any,
    !!authUser,
  );

  return result.send(category);
};

const createProductCategory = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateMainCategoryReq & { mainCategoryId: number } =
    request.body;
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage: string[] = [];
  if (!data.name) {
    errorMessage.push('Name is required');
  }
  if (!data.mainCategoryId) {
    errorMessage.push('CategoryId is required');
  }
  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const main = await ProductMainCategoryService.getById(data.mainCategoryId);
  if (!main) {
    return result
      .status(400)
      .send({ message: 'Product main category not found' });
  }

  const params: ICreateProductCategoryModels = {
    code: data.code,
    name: data.name,
    avatarUrl: data.avatarUrl,
    mainCategoryId: data.mainCategoryId,
    createdBy: authUser.id.toString(),
  };

  const category = await ProductCategoryService.create(params);

  if (!category) return result.status(500).send(new ReporingError().toModel());

  return result.send(ProductCategoryService.toModel(category));
};

const updateProductCategory = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateMainCategoryReq & {
    id: number;
    mainCategoryId: number;
    status: ObjectStatus;
  } = request.body;
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage: string[] = [];
  if (!data.id) {
    errorMessage.push('Id is required');
  }
  if (!data.name) {
    errorMessage.push('Name is required');
  }
  if (!data.mainCategoryId) {
    errorMessage.push('CategoryId is required');
  }
  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const main = await ProductMainCategoryService.getById(data.mainCategoryId);
  if (!main) {
    return result
      .status(400)
      .send({ message: 'Product main category not found' });
  }

  const params: ICreateProductCategoryModels = {
    code: data.code,
    name: data.name,
    avatarUrl: data.avatarUrl,
    mainCategoryId: data.mainCategoryId,
    updatedBy: authUser.id.toString(),
    objectStatus: data.status,
  };

  const category = await ProductCategoryService.update(data.id, params);
  if (!category) return result.status(500).send(new ReporingError().toModel());

  return result.send({ message: 'Success' });
};

const deleteProductCategory = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const productCategoryId = Number(request.params.id);

  const hasDelete = await ProductCategoryService.delete(productCategoryId);

  if (!hasDelete)
    return result
      .status(400)
      .send('Không thể xoá vì có sản phẩm theo mã danh mục này');

  return result.send({ message: 'Success' });
};

const getProducts = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const query = request.query;
  const authUser = await checkAuthentication(request);

  const skipProductIds = query.skipIds
    ? query.skipIds.length > 1
      ? (query.skipIds as string[]).map((id) => Number(id))
      : [Number(query.skipIds)]
    : [];

  const params: IGetProductReq = {
    categoryId: Number(query.categoryId),
    keyword: (query.keyword as string) || '',
    page: Number(query.page),
    pageSize: Number(query.pageSize),
    sortDirections: (query.sortDirections as OrderDirection[]) || [],
    sortNames: (query.sortNames as string[]) || [],
    allItems: query.allItems
      ? query.allItems
        ? (query.allItems as string).toLowerCase() === 'true'
        : false
        ? true
        : false
      : false,
    status: (query.status as ObjectStatus) || null,
    skipIds: skipProductIds,
  };

  const products = await ProductService.getBySearchParams(
    params,
    authUser ? authUser.id : null,
  );

  return result.send(products);
};

const getProductsByIds = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const { ids } = request.query;

  const authUser = await checkAuthentication(request);

  if (!ids || !ids.length) {
    return result.status(400).send({ message: 'Thiếu id của sản phẩm' });
  }

  const productIds =
    ids.length > 1 ? (ids as string[]).map((id) => Number(id)) : [Number(ids)];

  const products = await ProductService.getByIds(productIds, authUser?.id);

  return result.send(products);
};

const createProduct = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateProductReq = request.body;
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage = validateCreateProductData(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateProductModels = {
    name: data.name,
    code: data.code || null,
    cashPrice: data.cashPrice || null,
    categoryId: data.categoryId,
    description: data.description || null,
    pointsPrice: data.pointsPrice || null,
    saleOff: data.saleOff || null,
    quantity: data.quantity || null,
    size: data.size ? data.size.join(',') : null,
    thumb: data.thumb,
    createdBy: authUser.id.toString(),
    content: data.content || null,
    avatarUrl: data.avatarUrl ? data.avatarUrl.join(';') : '',
  };

  const newProduct = await ProductService.create(params);

  if (!newProduct) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send({ productId: newProduct.id });
};

const updateProduct = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateProductReq & { id: number } = request.body;
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage = validateCreateProductData(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const product = await ProductService.getById(data.id);
  if (!product) {
    return result.status(400).send({
      message: 'Product not found',
    });
  }

  const params: ICreateProductModels = {
    name: data.name,
    code: data.code || null,
    cashPrice: data.cashPrice || null,
    categoryId: data.categoryId,
    description: data.description || null,
    pointsPrice: data.pointsPrice || null,
    saleOff: data.saleOff || null,
    quantity: data.quantity || null,
    size: data.size ? data.size.join(',') : null,
    thumb: data.thumb,
    updatedBy: authUser.id.toString(),
    content: data.content || null,
    objectStatus: data.status,
    avatarUrl: data.avatarUrl ? data.avatarUrl.join(';') : '',
  };

  const hasUpdate = await ProductService.update(data.id, params);

  if (!hasUpdate) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send({ message: 'Success' });
};

const deleteProduct = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const productId = Number(request.params.id);

  const hasDelete = await ProductService.delete(productId);

  if (!hasDelete) return result.status(400).send({ message: 'Không thể xoá!' });

  return result.send({ message: 'Success' });
};

const getProductDetail = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const productId = Number(request.params.id);
  const authUser = await checkAuthentication(request);

  const product = await ProductService.getById(
    productId,
    authUser ? authUser.id : null,
  );

  if (!product) {
    return result.status(400).send({ message: 'Product not found' });
  }

  const avaverage = await ProductCommentService.averageStar(productId);

  return result.send({ ...product, avaverageStar: avaverage });
};

const getProductComments = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const query = request.query;
  const productId = Number(request.params.productId);

  const params: IGetProductCommnetReq = {
    productId: productId,
    page: Number(query.page),
    pageSize: Number(query.pageSize),
  };

  const comments = await ProductCommentService.getByProductId(params);

  return result.send({
    ...comments,
    items: comments.items.map((item) => ProductCommentService.toModel(item)),
  });
};

const createCommentToProduct = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateProductCommentReq = request.body;
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage = validateCreateCommentData(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateProductCommentModels = {
    productId: data.productId,
    title: data.title,
    comment: data.comment,
    email: data.email,
    nameUserComment: data.nameUserComment,
    star: data.star,
    userId: authUser ? authUser.id : null,
    createdBy: authUser ? authUser.id.toString() : null,
  };

  const comment = await ProductCommentService.create(params);

  return result.send(ProductCommentService.toModel(comment));
};

const validateCreateCommentData = (data: ICreateProductCommentReq) => {
  const errorDatas = {
    productId: 'ProductId is required',
    title: 'Title is required',
    comment: 'Comment is required',
    email: 'Email is required',
    nameUserComment: 'Name user is required',
    star: 'Star is required',
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  if (data.email && !hasEmail(data.email)) {
    message.push('Email not valid');
  }
  return message;
};

const validateCreateProductData = (data: ICreateProductReq) => {
  const errorDatas = {
    name: 'Name is required',
    categoryId: 'CategoryId is required',
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  const hasAbsolutePath = checkContentContainingAbsolutePath(
    data.content || '',
  );

  if (hasAbsolutePath) {
    message.push('Hình ảnh trong nội dung không nên chứa đường dẩn tuyệt đối!');
  }

  if (!data.avatarUrl && !data.avatarUrl.length) {
    message.push('Avatar is required');
  }
  if (data.avatarUrl && data.avatarUrl.length) {
    if (data.avatarUrl.some((item) => !item)) {
      message.push('Avatar not null');
    }
  }
  return message;
};

const addOrRemoveProductToWhishlist = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const productId = Number(request.params.id);

  const isLike = await WishlistService.getByUserAndProductId(
    productId,
    authUser.id,
  );

  if (isLike) {
    await WishlistService.disabled(isLike.id);
  } else {
    const hasCreate = await WishlistService.create({
      userId: authUser.id,
      productId: productId,
    });

    if (!hasCreate) {
      return result.status(500).send(new ReporingError().toModel());
    }
  }

  return result.send({ message: 'Success' });
};

export default {
  getAllProductMainCategory,
  createProductMainCategory,
  updateProductMainCategory,
  deleteProductMainCategory,
  getAllProductCategory,
  getProducts,
  getProductDetail,
  getProductComments,
  createCommentToProduct,
  addOrRemoveProductToWhishlist,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByIds,
};
