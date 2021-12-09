import admin from 'firebase-admin';
import {
  MessagingDevicesResponse,
  MessagingOptions,
  MessagingPayload,
  MessagingTopicResponse,
} from 'firebase-admin/lib/messaging/messaging-api';

export enum FCMPriority {
  Normal = 'normal',
  High = 'high',
}

export interface IFirebaseService {
  sendMessageToAllUsersByTopic: (
    payload: MessagingPayload,
    priority?: FCMPriority,
  ) => Promise<MessagingTopicResponse>;
  sendMessageToDevice: (
    fcmToken: string | string[],
    payload: MessagingPayload,
    priority?: FCMPriority,
  ) => Promise<MessagingDevicesResponse>;
}

const sendMessageToAllUsersByTopic = async (
  payload: MessagingPayload,
  priority: FCMPriority = FCMPriority.Normal,
): Promise<MessagingTopicResponse> => {
  const options: MessagingOptions = {
    timeToLive: 86400,
    priority: priority,
  };

  const res = await admin
    .messaging()
    .sendToTopic('notification', payload, options);

  return res;
};

const sendMessageToDevice = async (
  fcmToken: string | string[],
  payload: MessagingPayload,
  priority: FCMPriority = FCMPriority.Normal,
): Promise<MessagingDevicesResponse> => {
  const options: MessagingOptions = {
    timeToLive: 86400,
    priority: priority,
  };

  const res = await admin.messaging().sendToDevice(fcmToken, payload, options);

  return res;
};

const FirebaseService: IFirebaseService = {
  sendMessageToAllUsersByTopic,
  sendMessageToDevice,
};

export default FirebaseService;
