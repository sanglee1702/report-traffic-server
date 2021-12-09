import { Request, Response } from 'express';
import { envConfig } from '../config/env.config';
import { checkAuthentication } from '../helpers/authentication.helpers';
import { ObjectStatus, Roles } from '../models/common/models.enum';
import { DiscountType } from '../models/discount.code.models';
import { ICreateGiftOpeningHistoryModels } from '../models/gift.opening.history.models';
import AdvertisementVideoService from '../services/advertisement.video.service';
import ChallengeService from '../services/challenges.service';
import DiscountCodeService from '../services/discount.code.service';
import GiftOpeningHistoryService from '../services/giftbox.history.service';
import UserChallengenService from '../services/user.challenge.service';
import UserDiscountCodeService from '../services/user.discount.code.service';
import { UnauthorizedError } from '../utils/error';
import { plusPointToUser } from './user.controller';

export enum OpenGiftType {
  DiscountCode = 'DiscountCode',
  Points = 'Points',
  Video = 'Video',
}

export enum GiftType {
  DiscountCode = 'DiscountCode',
  Points = 'Points',
}

export interface IGiftboxRes {
  advertisementVideo: {
    name: string;
    description: string;
    linkVideo: string;
    directLink: string;
    videoId: string;
  } | null;
  discount: {
    id: number;
    code: string;
    name: string;
    description: string;
    avatarUrl: string;
    thumbUrl: string;
    brandName: string;
    brandUrl: string;
    brandThumbUrl: string;
    expireDate: string | Date;
    numberOfUses: number;
    percentDiscount: number;
    discountAmount: number;
    maximumDiscountAmount: number;
    type: DiscountType;
  } | null;
  points: number | null;
}

//#region  open gift

const openChallengGiftbox = async (request: Request, result: Response) => {
  // request data
  const currentGiftReceiving = Number(request.query.currentGiftReceiving);

  // check permissions
  const authUser = await checkAuthentication(request, [Roles.Users]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  // check has current user challenge
  const userChallenge = await UserChallengenService.getCurrent(authUser.id);
  if (!userChallenge || !userChallenge.isPaid) {
    return result.status(400).send({ message: 'Not found current challenge' });
  }
  if (currentGiftReceiving > userChallenge.currentGiftReceiving) {
    return result.status(400).send({ message: 'Hộp quà này chưa thể mở được' });
  }

  const challenge = await ChallengeService.getById(userChallenge.challengesId);
  if (
    !challenge.giftReceivingMilestone
      .split(',')
      .some((c) => Number(c) === currentGiftReceiving)
  ) {
    return result.status(400).send({ message: 'Mốc hộp quà không đúng' });
  }
  if (
    userChallenge.giftBoxesOpened &&
    userChallenge.giftBoxesOpened
      .split(',')
      .some((item) => Number(item) === currentGiftReceiving)
  ) {
    return result
      .status(400)
      .send({ message: 'Hộp quà này đã được mở trước đó' });
  }
  // create gift
  const giftType = randomGiftType();
  let resData: IGiftboxRes = {} as IGiftboxRes;

  if (giftType === OpenGiftType.Video) {
    resData = await randomAdvertisementVideo();
  }
  if (giftType === OpenGiftType.Points) {
    resData = randomPoint();
  }
  if (giftType === OpenGiftType.DiscountCode) {
    resData = await randomDiscount();
  }

  // if has points
  if (resData.points) {
    // plus points for user
    await plusPointToUser(resData.points, authUser.id);
  }
  // if has discount code
  if (resData.discount) {
    // save discount for user
    UserDiscountCodeService.create({
      ...resData.discount,
      userId: authUser.id,
    });
    // remove discount in list discount
    DiscountCodeService.delete(resData.discount.id);
  }

  //  save used code
  await UserChallengenService.update(userChallenge.id, {
    giftBoxesOpened: userChallenge.giftBoxesOpened
      ? userChallenge.giftBoxesOpened + ',' + currentGiftReceiving
      : currentGiftReceiving.toString(),
  });

  // create history
  const params: ICreateGiftOpeningHistoryModels = {
    userId: authUser.id,
    advertisementVideo: JSON.stringify(resData.advertisementVideo),
    discount: JSON.stringify(resData.discount),
    points: resData.points,
    createdBy: authUser.id.toString(),
  };
  await GiftOpeningHistoryService.create(params);

  return result.send(resData);
};

const randomGiftType = (): OpenGiftType => {
  // ratio DiscountCode(20%), Points(20%), Video(60%)
  const arrIndex = [
    OpenGiftType.Video,
    OpenGiftType.Points,
    OpenGiftType.DiscountCode,
    OpenGiftType.Video,
    OpenGiftType.Video,
    OpenGiftType.DiscountCode,
    OpenGiftType.Video,
    OpenGiftType.Points,
    OpenGiftType.Video,
    OpenGiftType.Video,
  ];
  const item = arrIndex[Math.floor(Math.random() * arrIndex.length)];

  return item;
};

const randomAdvertisementVideo = async (): Promise<IGiftboxRes> => {
  // get list video
  const videos = await AdvertisementVideoService.getList({
    allItems: true,
    status: ObjectStatus.Active,
  });

  let resData: IGiftboxRes = {
    advertisementVideo: null,
    discount: null,
    points: 0,
  };

  if (videos.items.length) {
    // random get 1 video
    const video = videos.items[Math.floor(Math.random() * videos.items.length)];

    resData = {
      advertisementVideo: {
        name: video.name,
        description: video.description,
        directLink: video.directLink,
        linkVideo: video.linkVideo,
        videoId: video.videoId,
      },
      discount: null,
      points: 0,
    };
  }

  // random gift is point or discount code
  const arrGiftType = [GiftType.DiscountCode, GiftType.Points];
  const type = arrGiftType[Math.floor(Math.random() * arrGiftType.length)];

  // if discount code then random discount code
  if (type === GiftType.DiscountCode) {
    const discount = await randomDiscount();

    resData = {
      ...resData,
      discount: discount.discount,
      points: discount.points,
    };
  }
  // else point random point
  if (type === GiftType.Points) {
    const point = randomPoint();

    resData = {
      ...resData,
      points: point.points,
    };
  }

  return resData;
};

const randomPoint = (): IGiftboxRes => {
  const maxPoint = envConfig.MAX_NUMBER_BONUS_POINT;

  const point = Math.ceil(Math.random() * maxPoint);

  return {
    discount: null,
    advertisementVideo: null,
    points: point,
  };
};

const randomDiscount = async (): Promise<IGiftboxRes> => {
  // get list video
  const discounts = await DiscountCodeService.getList({
    allItems: true,
    status: ObjectStatus.Active,
    hasNotExpired: true,
  });

  let giftbox: IGiftboxRes = {
    discount: null,
    advertisementVideo: null,
    points: 0,
  };

  if (discounts.items.length) {
    // random get 1 video
    const discount =
      discounts.items[Math.floor(Math.random() * discounts.items.length)];

    giftbox = {
      ...giftbox,
      discount: {
        id: discount.id,
        name: discount.name,
        code: discount.code,
        avatarUrl: discount.avatarUrl,
        description: discount.description,
        expireDate: discount.expireDate,
        numberOfUses: discount.numberOfUses,
        percentDiscount: discount.percentDiscount,
        discountAmount: discount.discountAmount,
        maximumDiscountAmount: discount.maximumDiscountAmount,
        type: discount.type,
        brandName: discount.brandName,
        brandThumbUrl: discount.brandThumbUrl,
        brandUrl: discount.brandUrl,
        thumbUrl: discount.thumbUrl,
      },
    };
  } else {
    const point = randomPoint();

    giftbox = {
      ...giftbox,
      points: point.points,
    };
  }

  return giftbox;
};

//#endregion open gift

export default {
  openChallengGiftbox,
};
