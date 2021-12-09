import { Request, Response } from 'express';
import { checkContentContainingAbsolutePath } from '../helpers';
import { checkAuthentication } from '../helpers/authentication.helpers';
import { ICreateArticleCategoryModels } from '../models/article.category.models';
import { ICreateArticleModels } from '../models/article.models';
import { ObjectStatus, Roles } from '../models/common/models.enum';
import ArticleCategoryService from '../services/article.category.service';
import ArticleService, { IGetArticleReq } from '../services/article.service';
import ArticleWishlistService from '../services/article.wishlist.service';
import { ReporingError, UnauthorizedError } from '../utils/error';

export interface ICreateArticleReq {
  title: string;
  description: string;
  code?: string;
  banner: string;
  tag: string[];
  content: string;
  categoryId: number;
  status?: ObjectStatus;
}

const getArticleCategories = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const query = request.query;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);

  const articles = await ArticleCategoryService.getList(query, !!authUser);

  return result.send(articles);
};

const createCategory = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateArticleCategoryModels = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  if (!data.name) {
    return result.status(400).send({
      message: 'Name is required',
    });
  }

  const params: ICreateArticleCategoryModels = {
    name: data.name,
    avatarUrl: data.avatarUrl,
    code: data.code,
    createdBy: authUser.id.toString(),
  };
  const category = await ArticleCategoryService.create(params);

  if (!category) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send(ArticleCategoryService.toModel(category));
};

const updateCategory = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateArticleCategoryModels & {
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
      message: 'Name is required',
    });
  }

  const params: ICreateArticleCategoryModels = {
    name: data.name,
    avatarUrl: data.avatarUrl,
    code: data.code,
    createdBy: authUser.id.toString(),
    objectStatus: data.status,
  };
  const category = await ArticleCategoryService.update(data.id, params);

  if (!category) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send({ message: 'Success' });
};

const deleteCategoryAsync = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const id = Number(request.params.categoryId);

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const hasDelete = await ArticleCategoryService.delete(id);

  if (!hasDelete) {
    return result.status(400).send({ message: 'Không thể xoá' });
  }

  return result.send({ message: 'Đã xoá' });
};

const getArticles = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const query: any = request.query;
  const authUser = await checkAuthentication(request);

  const params: IGetArticleReq = {
    keyword: query.keyword,
    categoryId: query.categoryId,
    page: query.page,
    pageSize: query.pageSize,
    sortDirections: query.sortDirections,
    sortNames: query.sortNames,
    userId: authUser ? authUser.id : 0,
    status: query.status,
  };
  const articles = await ArticleService.getList(params);

  if (!articles) {
    result.status(500).send(new ReporingError().toModel());
  }

  return result.send({
    ...articles,
    items: articles.items.map((article) =>
      ArticleService.toModel(
        article,
        (article as any).ArticleWishlist ? true : false,
      ),
    ),
  });
};

const getArticle = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const id = Number(request.params.articleId);
  const authUser = await checkAuthentication(request);

  const article = await ArticleService.getById(
    id,
    authUser ? authUser.id : null,
  );

  if (!article) {
    return result.send({ message: 'Article not found' });
  }

  return result.send(
    ArticleService.toModel(
      article,
      (article as any).ArticleWishlist ? true : false,
    ),
  );
};

const create = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateArticleReq = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage = validateCreate(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateArticleModels = {
    title: data.title,
    description: data.description,
    content: data.content,
    banner: data.banner,
    tag: data.tag.join(','),
    categoryId: data.categoryId,
    code: data.code,
    createdBy: authUser.id.toString(),
  };
  const article = await ArticleService.create(params);

  if (!article) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send(ArticleService.toModel(article, false));
};

const update = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateArticleReq & { id: number } = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage = validateCreate(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateArticleModels = {
    title: data.title,
    description: data.description,
    content: data.content,
    banner: data.banner,
    tag: data.tag.join(','),
    categoryId: data.categoryId,
    code: data.code,
    updatedBy: authUser.id.toString(),
    objectStatus: data.status,
  };
  const hasUpdate = await ArticleService.update(data.id, params);

  if (!hasUpdate) {
    return result.status(400).send({ message: 'Update article has error' });
  }

  return result.send({ message: 'Update article successfully' });
};

const deleteAsync = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const id = Number(request.params.id);

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const hasDelete = await ArticleService.delete(id);

  if (!hasDelete) {
    return result.status(400).send({code: 400, message: 'Không thể xoá tin này!' });
  }

  return result.send({ message: 'Đã xoá' });
};

const addOrRemoveArticleToWhishlist = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const articleId = Number(request.params.id);

  const isLike = await ArticleWishlistService.getByUserAndArticleId(
    articleId,
    authUser.id,
  );

  if (isLike) {
    await ArticleWishlistService.disabled(isLike.id);
  } else {
    const hasCreate = await ArticleWishlistService.create({
      userId: authUser.id,
      articleId: articleId,
    });

    if (!hasCreate) {
      return result.status(500).send(new ReporingError().toModel());
    }
  }

  return result.send({ message: 'Success' });
};

const validateCreate = (data: ICreateArticleReq) => {
  const errorDatas = {
    title: 'Title is required',
    description: 'Description is required',
    banner: 'Banner is required',
    categoryId: 'CategoryId is required',
  };

  let message: string[] = [];

  const hasAbsolutePath = checkContentContainingAbsolutePath(
    data.content || '',
  );

  if (hasAbsolutePath) {
    message.push('Hình ảnh trong nội dung không nên chứa đường dẩn tuyệt đối!');
  }

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  return message;
};

export default {
  getArticles,
  getArticle,
  create,
  update,
  deleteAsync,
  getArticleCategories,
  createCategory,
  updateCategory,
  deleteCategoryAsync,
  addOrRemoveArticleToWhishlist,
};
