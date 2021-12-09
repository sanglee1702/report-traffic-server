import { Request, Response } from 'express';
import { checkAuthentication } from '../helpers/authentication.helpers';
import { ICreateAdvertisementVideoModels } from '../models/advertisement.video.models';
import { ObjectStatus, Roles } from '../models/common/models.enum';
import AdvertisementVideoService from '../services/advertisement.video.service';
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

  const advertisementVideos = await AdvertisementVideoService.getList(query);

  return result.send(advertisementVideos);
};
const create = async (request: Request, result: Response) => {
  const data: ICreateAdvertisementVideoModels = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errMessage = validate(data);
  if (errMessage.length) {
    return result.status(400).send({ message: errMessage.join(', ') });
  }

  const params: ICreateAdvertisementVideoModels = {
    name: data.name,
    description: data.description,
    directLink: data.directLink,
    linkVideo: data.linkVideo,
    videoId: data.videoId,
    createdBy: authUser.id.toString(),
  };

  const advertisementVideo = await AdvertisementVideoService.create(params);

  if (!advertisementVideo)
    return result.status(500).send(new ReporingError().toModel());

  return result.send(AdvertisementVideoService.toModel(advertisementVideo));
};
const update = async (request: Request, result: Response) => {
  const id = Number(request.params.id);
  const data: ICreateAdvertisementVideoModels & {
    status: ObjectStatus;
  } = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const advertisementVideo = await AdvertisementVideoService.getById(id);
  if (!advertisementVideo)
    return result.status(400).send({ message: 'Không tìm thấy!' });

  const errMessage = validate(data);
  if (errMessage.length) {
    return result.status(400).send({ message: errMessage.join(', ') });
  }

  const params: ICreateAdvertisementVideoModels = {
    name: data.name,
    description: data.description,
    directLink: data.directLink,
    linkVideo: data.linkVideo,
    videoId: data.videoId,
    updatedBy: authUser.id.toString(),
  };

  const hasUpdate = await AdvertisementVideoService.update(id, params);

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

  const advertisementVideo = await AdvertisementVideoService.delete(id);

  if (!advertisementVideo)
    return result.status(400).send({ message: 'Không thể xoá' });

  return result.send({ message: 'Đã xoá' });
};
const validate = (data: ICreateAdvertisementVideoModels): string[] => {
  const errorDatas = {
    name: 'Tên bắt buộc nhập',
    directLink: 'Vui lòng nhập đường dẩn quảng cáo',
    linkVideo: 'Vui lòng nhập đường dẩn video',
    videoId: 'Vui lòng nhập video id',
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  return message;
};

export default {
  gets,
  create,
  update,
  deleteAsync,
};
