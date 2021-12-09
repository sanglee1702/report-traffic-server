import { Request, Response } from 'express';
import { MessagingPayload } from 'firebase-admin/lib/messaging/messaging-api';
import { checkAuthentication } from '../helpers/authentication.helpers';
import { ObjectStatus, Roles } from '../models/common/models.enum';
import {
  ICreateNotificationsModels,
  IGetNotificationsReq,
} from '../models/notifications.models';
import FirebaseService from '../services/firebase.service';
import NotificationsService from '../services/notifications.service';
import { ReporingError, UnauthorizedError } from '../utils/error';

const gets = async (request: Request, result: Response) => {
  const query: any = request.query;

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const params: IGetNotificationsReq = query;

  const notifications = await NotificationsService.getBySearchParams(params);

  return result.send(notifications);
};
const create = async (request: Request, result: Response) => {
  const data: ICreateNotificationsModels = request.body;

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

  const params: ICreateNotificationsModels = {
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl || null,
    thumb: data.thumb || null,
    type: data.type,
    moreData: data.moreData || null,
    userId: data.userId || null,
    createdBy: authUser.id.toString(),
  };

  const notification = await NotificationsService.create(params);

  if (!notification)
    return result.status(500).send(new ReporingError().toModel());

  return result.send(NotificationsService.toModel(notification));
};
const update = async (request: Request, result: Response) => {
  const id = Number(request.params.id);
  const data: ICreateNotificationsModels & {
    status: ObjectStatus;
  } = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const notification = await NotificationsService.getById(id);
  if (!notification)
    return result.status(400).send({ message: 'Không tìm thấy!' });

  const errMessage = validate(data);
  if (errMessage.length) {
    return result.status(400).send({ message: errMessage.join(', ') });
  }

  const params: ICreateNotificationsModels = {
    title: data.title,
    description: data.description,
    imageUrl: data.imageUrl || null,
    thumb: data.thumb || null,
    type: data.type,
    moreData: data.moreData || null,
    userId: data.userId || null,
    objectStatus: data.status,
    updatedBy: authUser.id.toString(),
  };

  const hasUpdate = await NotificationsService.update(id, params);

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

  const notification = await NotificationsService.delete(id);

  if (!notification)
    return result.status(400).send({ message: 'Không thể xoá' });

  return result.send({ message: 'Đã xoá' });
};
const pushNotification = async (request: Request, result: Response) => {
  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);

  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const id = Number(request.params.id);

  const notification = await NotificationsService.getById(id);

  if (!notification)
    return result.status(400).send({ message: 'Không tìm thấy thông báo' });

  const payload: MessagingPayload = {
    notification: {
      title: notification.title,
      body: notification.description,
    },
    data: {
      notification: JSON.stringify(notification),
    },
  };
  // push notification
  FirebaseService.sendMessageToAllUsersByTopic(payload);

  return result.send(true);
};
const getsByUser = async (request: Request, result: Response) => {
  const query: any = request.query;
  const authUser = await checkAuthentication(request);

  const notifications = await NotificationsService.getByUser(
    query,
    authUser?.id,
  );

  return result.send(notifications);
};
const deleteByUserAsync = async (request: Request, result: Response) => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const id = Number(request.params.id);

  const notification = await NotificationsService.getById(id);

  if (!notification) return result.send(true);
  else {
    if (notification.userId && notification.userId === authUser.id) {
      const hasDelete = await NotificationsService.delete(id);

      return result.send(hasDelete);
    } else if (!notification.userId) {
      let deletes: number[] = notification.deletes
        ? JSON.parse(notification.deletes)
        : [];
      deletes.push(authUser.id);

      const hasDelete = await NotificationsService.update(id, {
        deletes: deletes.join(','),
      });

      return result.send(hasDelete);
    } else {
      return result.send(true);
    }
  }
};
const markAsReadAsync = async (request: Request, result: Response) => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const id = Number(request.params.id);

  const notification = await NotificationsService.getById(id);

  if (!notification)
    return result.status(400).send({ message: 'Thông báo không tồn tại!' });

  let reads: number[] = notification.reads
    ? JSON.parse(notification.reads)
    : [];
  reads.push(authUser.id);

  const hasUpdate = await NotificationsService.update(id, {
    reads: reads.join(','),
  });

  return result.send(hasUpdate);
};

interface IMarkAsReadAllReq {
  ids: number[];
}
const markAsReadAllAsync = async (request: Request, result: Response) => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  const data: IMarkAsReadAllReq = request.body;

  // list id has update
  let updates: { status: boolean; id: number }[] = [];

  //  update each element
  for (let i = 0; i < data.ids.length; i++) {
    const id = data.ids[i];

    // get notification
    const notification = await NotificationsService.getById(id);

    // check if
    if (!notification) {
      updates.push({ status: false, id });
    } else {
      let reads: number[] = notification.reads
        ? JSON.parse(notification.reads)
        : [];

      // check if has in row then return
      if (reads.includes(authUser.id)) {
        updates.push({ status: true, id });
      } else {
        reads.push(authUser.id);

        // update
        const hasUpdate = await NotificationsService.update(id, {
          reads: reads.join(','),
        });

        if (hasUpdate) updates.push({ status: true, id });
        else updates.push({ status: false, id });
      }
    }
  }

  return result.send(updates);
};

const validate = (data: ICreateNotificationsModels): string[] => {
  const errorDatas = {
    title: 'Vui lòng nhập tiêu đề.',
    description: 'Vui lòng nhập mô tả.',
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  // if (!Object.values(Notifications).includes(data.type)) {
  //   message.push('Kiểu thông báo không đúng!');
  // }

  return message;
};

const NotificationsControllers = {
  gets,
  create,
  update,
  deleteAsync,
  pushNotification,
  getsByUser,
  deleteByUserAsync,
  markAsReadAsync,
  markAsReadAllAsync,
};

export default NotificationsControllers;
