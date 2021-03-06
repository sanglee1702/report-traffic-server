import { Request, Response } from "express";
import { checkAuthentication } from "../helpers/authentication.helpers";
import { ICreateCategoryModels } from "../models/category.models";
import { ObjectStatus, Roles } from "../models/common/models.enum";
import { BasePagingReq } from "../models/common/models.type";
import CategoryService from "../services/category.service";
import { ReporingError, UnauthorizedError } from "../utils/error";

const create = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateCategoryModels = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  if (!data.name) {
    return result.status(400).send({
      message: "Name is required",
    });
  }

  const params: ICreateCategoryModels = {
    name: data.name,
    code: data.code,
    level: data.level,
    parentId: data.parentId,
    groupId: data.groupId,
    createdBy: authUser.id.toString(),
  };
  const category = await CategoryService.create(params);

  if (!category) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send(CategoryService.toModel(category));
};

const update = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateCategoryModels & {
    id: number;
    status: ObjectStatus;
  } = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  if (!data.name) {
    return result.status(400).send({
      message: "Name is required",
    });
  }

  const params: ICreateCategoryModels = {
    name: data.name,
    code: data.code,
    level: data.level,
    parentId: data.parentId,
    groupId: data.groupId,
    createdBy: authUser.id.toString(),
    objectStatus: data.status,
  };
  const category = await CategoryService.update(data.id, params);

  if (!category) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send({ message: "Success" });
};

const getList = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const query: any = request.query;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const params: BasePagingReq = {
    keyword: query.keyword,
    page: query.page,
    pageSize: query.pageSize,
    sortDirections: query.sortDirections,
    sortNames: query.sortNames,
    status: query.status,
  };
  const categories = await CategoryService.getList(params);

  if (!categories) {
    result.status(500).send(new ReporingError().toModel());
  }

  return result.send({
    ...categories,
    items: categories.items.map((category) =>
      CategoryService.toModel(category, (category as any).GroupCategory)
    ),
  });
};

const getById = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const id = Number(request.params.categoryId);

  const category = await CategoryService.getById(id);

  if (!category) {
    return result.send({ message: "Article not found" });
  }

  return result.send(CategoryService.toModel(category));
};

const deleteAsync = async (
  request: Request,
  result: Response
): Promise<Response<any, Record<string, any>>> => {
  const id = Number(request.params.id);

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const hasDelete = await CategoryService.delete(id);

  if (!hasDelete) {
    return result
      .status(400)
      .send({ code: 400, message: "Kh??ng th??? xo?? tin n??y!" });
  }

  return result.send({ message: "???? xo??" });
};

const CategoryControllers = {
  getList,
  getById,
  deleteAsync,
  create,
  update,
};

export default CategoryControllers;
