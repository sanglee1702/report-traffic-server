import { Request, Response } from 'express';
import moment from 'moment';
import { checkAuthentication } from '../helpers/authentication.helpers';
import {
  IChallengesModels,
  ICreateChallengesModels,
} from '../models/challenges.models';
import { ObjectStatus, Roles } from '../models/common/models.enum';
import { IHistoryRunModels } from '../models/history.run.models';
import {
  ChallengeStatus,
  IUserChallengeModels,
} from '../models/user.challenge.models';
import ChallengeService from '../services/challenges.service';
import HistoryRunService, {
  IHistoryRunRes,
} from '../services/history.run.service';
import UserChallengenService from '../services/user.challenge.service';
import { ReporingError, UnauthorizedError } from '../utils/error';
import { plusPointToUser } from './user.controller';

export interface ICreateChallengesReq {
  totalDate: number;
  price: number;
  name: string;
  avatarUrl?: string;
  totalRun: number;
  minUserRun?: number;
  isGroupChallenges: boolean;
  type: string;
  giftReceivingMilestone: number[];
  backgrounds: string[];
  submittedBeforeDay: number;
  discountPrice: number;
  starDateDiscount: string | Date;
  endDateDiscount: string | Date;
  totalNumberOfDiscounts: number;
}

export interface ISearchUserChallengeReq {
  startDate: string | Date;
  endDate: string | Date;
}

export interface IUserChallengeHistoryRes {
  id: number;
  challengesId: number;
  startDate: Date | string | null;
  endDate: Date | string | null;
  totalRun: number;
  groupId: number;
  totalUserRun: number;
  currentGiftReceiving: number;
  histories: IChallengeChart[];
  giftBoxesOpened: number[];
  unopenedGift: number[];
  runRemainingToOpen: number;
  submittedBeforeDay: number;
}

export interface IChallengeChart {
  key: number;
  background: string;
  firstDay: IDayRes | null;
  secondDay: IDayRes | null;
  thirdDay: IDayRes | null;
}

export interface IDayRes {
  label: string;
  value: number;
  gift: { id: number }[];
  date: string | Date;
}

//#region  API
const getAllChallenges = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const query = request.query;

  const challenges = await ChallengeService.getAll(query);

  if (!challenges) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send(challenges);
};

const create = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateChallengesReq = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage = validateCreateData(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateChallengesModels = {
    totalDate: data.totalDate,
    price: data.price,
    name: data.name,
    avatarUrl: data.avatarUrl,
    totalRun: Number(data.totalRun),
    minUserRun: data.minUserRun || 0,
    isGroupChallenges: data.isGroupChallenges ? true : false,
    type: data.type,
    giftReceivingMilestone: data.giftReceivingMilestone.join(','),
    createdBy: authUser.id.toString(),
    backgrounds:
      data.backgrounds && data.backgrounds.length
        ? data.backgrounds.join(';')
        : '',
    submittedBeforeDay: data.submittedBeforeDay ?? 0,
    discountPrice: data.discountPrice,
    endDateDiscount: data.endDateDiscount,
    starDateDiscount: data.starDateDiscount,
    totalNumberOfDiscounts: data.totalNumberOfDiscounts,
  };

  const challenge = await ChallengeService.create(params);

  return result.send(ChallengeService.toModel(challenge));
};

const update = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const id = Number(request.params.id);

  const data: ICreateChallengesReq & { status: ObjectStatus } = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  let errorMessage = validateCreateData(data);
  if (!id) {
    errorMessage = ['Id is required', ...errorMessage];
  }

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateChallengesModels = {
    totalDate: data.totalDate,
    price: data.price,
    name: data.name,
    avatarUrl: data.avatarUrl,
    totalRun: Number(data.totalRun),
    minUserRun: data.minUserRun || 0,
    isGroupChallenges: data.isGroupChallenges ? true : false,
    type: data.type,
    giftReceivingMilestone: data.giftReceivingMilestone.join(','),
    updatedBy: authUser.id.toString(),
    objectStatus: data.status,
    backgrounds:
      data.backgrounds && data.backgrounds.length
        ? data.backgrounds.join(';')
        : '',
    submittedBeforeDay: data.submittedBeforeDay ?? 0,
    discountPrice: data.discountPrice,
    endDateDiscount: data.endDateDiscount,
    starDateDiscount: data.starDateDiscount,
    totalNumberOfDiscounts: data.totalNumberOfDiscounts,
  };

  const hasUpdate = await ChallengeService.update(id, params);

  if (!hasUpdate) {
    return result.status(400).send({ message: 'Id not found' });
  }

  return result.send(hasUpdate);
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

  const hasDelete = await ChallengeService.delete(id);

  if (!hasDelete) {
    return result.status(400).send({ message: 'Không thể xoá thử thách này!' });
  }

  return result.send({ message: 'Đã xoá' });
};

const getCurrentHistoryRun = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }
  // current challenge is this user
  const currentChallenge = await UserChallengenService.getCurrent(authUser.id);

  if (!currentChallenge || !currentChallenge.isPaid) {
    return result.status(400).send({ message: 'Not found current challenge.' });
  }

  const dateParams = {
    startDate: currentChallenge.startDate,
    endDate: currentChallenge.endDate,
  };
  // total run
  const totalUserRun = await HistoryRunService.getTotalRunValue(
    currentChallenge.id,
    dateParams,
  );
  // this challenge
  const challenge = await ChallengeService.getById(
    currentChallenge.challengesId,
  );
  // history run

  const history = await HistoryRunService.getByUserChallengeId(
    currentChallenge.id,
    dateParams,
  );

  const challengeData = toModelCurrentChallengeHistory(
    currentChallenge,
    history,
    challenge,
    totalUserRun,
  );

  return result.send(challengeData);
};

const updateTodayStepCount = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: { totalRun: number } = request.body;

  const totalRun = Number(data.totalRun);

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const currentChallenge = await UserChallengenService.getCurrent(authUser.id);

  if (!currentChallenge || !currentChallenge.isPaid) {
    return result.status(400).send({ message: 'Không tìm thấy thử thách' });
  }

  const thisDate = new Date();

  if (thisDate < new Date(currentChallenge.startDate)) {
    return result.status(400).send({
      message: 'Thử thách bắt đầu vào ngày hôm sau',
      type: 'ErrorStartDate',
    });
  }
  if (thisDate > new Date(currentChallenge.endDate)) {
    return result
      .status(400)
      .send({ message: 'Thử thách đã kết thúc', type: 'ErrorEndDate' });
  }

  const history = await HistoryRunService.getByUserChallengeId(
    currentChallenge.id,
    {
      startDate: moment(new Date())
        .set('hour', 0)
        .set('minute', 0)
        .toISOString(),
      endDate: moment(new Date())
        .set('hour', 23)
        .set('minute', 59)
        .toISOString(),
    },
  );
  // current total run
  let total = await HistoryRunService.getTotalRunValue(currentChallenge.id, {
    startDate: currentChallenge.startDate,
    endDate: currentChallenge.endDate,
  });

  const res = await ChallengeService.getById(currentChallenge.challengesId);
  const challenge = ChallengeService.toModel(res);

  if (history.length) {
    const thisHistory = history[0];
    total = total + totalRun - thisHistory.totalRun;

    const res = await HistoryRunService.update(thisHistory.id, {
      totalRun: totalRun || 0,
    });

    if (!res) {
      return result.status(500).send(new ReporingError().toModel());
    }
  } else {
    total = total + totalRun;
    const res = await HistoryRunService.create({
      totalRun: totalRun || 0,
      userChallengeId: currentChallenge.id,
      userId: authUser.id,
      createdBy: authUser.id.toString(),
    });

    if (!res) {
      return result.status(500).send(new ReporingError().toModel());
    }
  }

  let currentGiftReceiving = 0;

  challenge.giftReceivingMilestone.forEach((f) => {
    if (total >= f) {
      currentGiftReceiving = f;
    }
  });

  await UserChallengenService.update(currentChallenge.id, {
    currentGiftReceiving: currentGiftReceiving,
  });

  return result.send({ message: 'Update Success!' });
};

const getChallenge = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const challengeId = request.params.challengeId;

  if (!challengeId) {
    return result.status(400).send({ message: 'Invalid challenge id' });
  }

  const challenge = await ChallengeService.getById(Number(challengeId));

  if (!challenge) {
    return result.status(400).send({ message: 'Not found challenge' });
  }

  return result.send(ChallengeService.toModel(challenge));
};

const markAsDone = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const userChallengeId = Number(request.params.userChallengeId);

  const authUser = await checkAuthentication(request);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const userChallenge = await UserChallengenService.getById(userChallengeId);

  if (!userChallenge) {
    return result.status(400).send({ message: 'Không tìm thấy thử thách' });
  }

  const challenge = await ChallengeService.getById(userChallenge.challengesId);

  if (!challenge) {
    return result.status(400).send({ message: 'Không tìm thấy thử thách' });
  }

  // check if before day has submitted
  const endDate = new Date(userChallenge.endDate);
  const thisDateMoment = moment(new Date()).format('YYYY-MM-DD');
  const thisDate = new Date(thisDateMoment);
  const submittedBeforeDay = challenge.submittedBeforeDay ?? 0;
  const endDateSubmit = new Date(
    endDate.setDate(endDate.getDate() - submittedBeforeDay),
  );

  if (thisDate < endDateSubmit) {
    return result.status(400).send({
      message: `Không thể hoàn thành thử thách này trước ngày ${moment(
        endDateSubmit,
      ).format('DD-MM-YYYY')}!`,
    });
  }

  // total run
  const totalUserRun = await HistoryRunService.getTotalRunValue(
    userChallengeId,
    {
      startDate: userChallenge.startDate,
      endDate: userChallenge.endDate,
    },
  );
  // check  totalRun <= challenge total run
  if (
    thisDate <= new Date(userChallenge.endDate) &&
    challenge.totalRun > totalUserRun
  ) {
    return result.status(400).send({
      message: `Bạn nên hoàn thành thử thách trước khi xác nhận hoàn thành!`,
    });
  }

  // check if completed
  if (challenge.totalRun <= totalUserRun) {
    const points = challenge.price + challenge.totalRun * 100;
    // plus points to user
    await plusPointToUser(points, authUser.id);

    // update user challenge status
    await UserChallengenService.update(userChallengeId, {
      status: ChallengeStatus.Completed,
      isCurrentChallenge: false,
    });
  }
  // check if not completed
  else {
    // update user challenge status
    await UserChallengenService.update(userChallengeId, {
      status: ChallengeStatus.NotCompleted,
      isCurrentChallenge: false,
    });
  }

  return result.send(true);
};
//#endregion  API

//#region  handle
const getArrDays = (
  histories: IHistoryRunRes[],
  totalDay: number,
  startDate: string | Date,
) => {
  let arrDays: IDayRes[] = [];
  const date = new Date(startDate);

  for (let i = 0; i < totalDay; i++) {
    const thisDate = moment(date)
      .set('date', date.getDate() + i)
      .format('YYYY-MM-DD');

    let totalRun = 0;
    let gift = [];

    const history = histories.find(
      (item) => moment(item.createdAt).format('YYYY-MM-DD') === thisDate,
    );

    if (history) {
      totalRun = history.totalRun;
      gift = history.unopenedGift;
    }

    arrDays.push({
      label: `Ngày ${i + 1}`,
      value: totalRun,
      gift: gift.map((id) => {
        return { id: id };
      }),
      date: thisDate,
    });
  }

  return arrDays;
};

const groupDate = (
  histories: IHistoryRunRes[],
  totalDay: number,
  startDate: string | Date,
  backgrounds: string[],
): IChallengeChart[] => {
  const arrDays: IDayRes[] = getArrDays(histories, totalDay, startDate);

  let challengeChartData: IChallengeChart[] = [];

  const challengeChartDataLength = Math.ceil(totalDay / 3);

  for (let i = 0; i < challengeChartDataLength; i++) {
    let firstIndex = 0;
    let secondIndex = 1;
    let thirdIndex = 2;

    if (i > 0) {
      firstIndex = i * 3;
      secondIndex = i * 3 + 1;
      thirdIndex = i * 3 + 2;
    }

    const firstDay = arrDays[firstIndex] ? arrDays[firstIndex] : null;
    const secondDay = arrDays[secondIndex] ? arrDays[secondIndex] : null;
    const thirdDay = arrDays[thirdIndex] ? arrDays[thirdIndex] : null;

    const background =
      backgrounds.length && backgrounds[i]
        ? backgrounds[i]
        : backgrounds[0] || '';

    let item: IChallengeChart = {
      background: background,
      key: i + 1,
      firstDay: firstDay,
      secondDay: secondDay,
      thirdDay: thirdDay,
    };

    challengeChartData.push(item);
  }

  return challengeChartData;
};

const toModelCurrentChallengeHistory = (
  currentChallenge: IUserChallengeModels,
  histories: IHistoryRunModels[],
  challenge: IChallengesModels,
  totalUserRun: number,
): IUserChallengeHistoryRes => {
  const giftReceivingMilestone = challenge.giftReceivingMilestone
    ? challenge.giftReceivingMilestone.split(',').map((item) => Number(item))
    : [];

  const giftBoxesOpened = currentChallenge.giftBoxesOpened
    ? currentChallenge.giftBoxesOpened.split(',').map((item) => Number(item))
    : [];

  let total = 0;
  let currentUnopenedGift: number[] = [];
  let oldCurrentUnopenedGift: number[] = [];

  const history = histories.map((item, index) => {
    total += item.totalRun;
    currentUnopenedGift = [];

    giftReceivingMilestone.forEach((giftReceivingNumber) => {
      if (giftReceivingNumber <= total) {
        if (index) {
          if (
            !giftBoxesOpened.includes(giftReceivingNumber) &&
            !oldCurrentUnopenedGift.includes(giftReceivingNumber)
          ) {
            currentUnopenedGift.push(giftReceivingNumber);
            oldCurrentUnopenedGift.push(giftReceivingNumber);
          }
        } else {
          if (!giftBoxesOpened.includes(giftReceivingNumber)) {
            currentUnopenedGift.push(giftReceivingNumber);
            oldCurrentUnopenedGift.push(giftReceivingNumber);
          }
        }
      }
    });

    return HistoryRunService.toModel(item, currentUnopenedGift);
  });

  const runRemainingToOpen = giftReceivingMilestone.filter(
    (item) => item > totalUserRun,
  );

  const challengeChartData = groupDate(
    history,
    challenge.totalDate,
    currentChallenge.startDate,
    challenge.backgrounds ? challenge.backgrounds.split(';') : [],
  );

  return {
    id: currentChallenge.id,
    challengesId: currentChallenge.challengesId,
    groupId: currentChallenge.groupId,
    totalRun: challenge.totalRun,
    totalUserRun: totalUserRun,
    startDate: currentChallenge.startDate,
    endDate: currentChallenge.endDate,
    currentGiftReceiving: currentChallenge.currentGiftReceiving,
    histories: challengeChartData,
    giftBoxesOpened: giftBoxesOpened,
    unopenedGift: giftBoxesOpened.length
      ? giftReceivingMilestone.filter(
          (item) =>
            !giftBoxesOpened.some((g) => g === item) && item <= totalUserRun,
        )
      : giftReceivingMilestone.filter((item) => item <= totalUserRun),
    runRemainingToOpen: runRemainingToOpen.length
      ? Number((runRemainingToOpen[0] - totalUserRun).toFixed(2))
      : 0,
    submittedBeforeDay: challenge.submittedBeforeDay,
  };
};

const validateCreateData = (data: ICreateChallengesReq): string[] => {
  const errorDatas = {
    totalDate: 'Số ngày bắt buộc nhập!',
    price: 'Số tiền bắt buộc nhập!',
    name: 'Tên bắt buộc nhập!',
    totalRun: 'Số km bắt buộc nhập!',
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  if (!data.starDateDiscount && data.endDateDiscount) {
    message.push('Vui lòng chọn ngày bắt đầu!');
  }
  if (data.starDateDiscount && !data.endDateDiscount) {
    message.push('Vui lòng chọn ngày kết thúc!');
  }

  if (
    data.starDateDiscount &&
    data.endDateDiscount &&
    new Date(data.starDateDiscount) >= new Date(data.endDateDiscount)
  ) {
    message.push('Ngày bắt đầu không thể sau ngày kết thúc!');
  }
  if (data.starDateDiscount && data.endDateDiscount && !data.discountPrice) {
    message.push('Vui lòng nhập số tiền giảm giá!');
  }
  if (
    data.starDateDiscount &&
    data.endDateDiscount &&
    !data.totalNumberOfDiscounts
  ) {
    message.push('Vui lòng nhập số lần giảm giá!');
  }

  return message;
};
//#endregion handle

export default {
  getAllChallenges,
  getCurrentHistoryRun,
  updateTodayStepCount,
  create,
  update,
  deleteAsync,
  getChallenge,
  markAsDone,
};
