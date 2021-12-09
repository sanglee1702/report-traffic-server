import { Request, Response } from 'express';
import { checkAuthentication } from '../helpers/authentication.helpers';
import { Roles } from '../models/common/models.enum';
import BannerService from '../services/banner.service';
import { ReporingError, UnauthorizedError } from '../utils/error';

interface ICreateBannerReq {
  url: string;
  position: number;
  description: string;
}

const getBanners = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const query = request.query;
  const banners = await BannerService.getList(query);

  return result.send(banners);
};

const create = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateBannerReq = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  if (!data.url) {
    return result.status(400).send({ message: 'URL is required' });
  }

  const banner = await BannerService.create({
    url: data.url,
    position: data.position || 0,
    description: data.description,
    createdBy: authUser.id.toString(),
  });

  if (!banner) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send(BannerService.toModel(banner));
};

const update = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const id = Number(request.params.id);
  const data: ICreateBannerReq = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  if (!id) {
    return result.status(400).send({ message: 'id is required' });
  }
  if (!data.url) {
    return result.status(400).send({ message: 'URL is required' });
  }

  const banner = await BannerService.update(id, {
    url: data.url,
    position: data.position || 0,
    description: data.description,
    createdBy: authUser.id.toString(),
  });

  if (!banner) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send({ message: 'Success' });
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

  const hasDelete = await BannerService.delete(id);

  if (!hasDelete) {
    return result.status(400).send({ message: 'Không thể xoá banner này' });
  }

  return result.send({ message: 'Đã xoá' });
};

export default { getBanners, create, update, deleteAsync };
