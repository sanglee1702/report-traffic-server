import logger from '../logs/logger';
import dbContext from '../models';
import { ObjectStatus } from '../models/common/models.enum';
import {
  ICreateCardLinkModels,
  ICardLinkModels,
  ICardLinkRes,
} from '../models/card.link.models';
import { getOrderQuery } from './helpers';

export interface ICardLinkService {
  create: (models: ICreateCardLinkModels) => Promise<ICardLinkModels | null>;
  update: (id: number, models: ICreateCardLinkModels) => Promise<boolean>;
  delete: (id: number) => Promise<boolean>;
  getByUserId: (userId: number) => Promise<ICardLinkModels[]>;
  toModel: (item: ICardLinkModels) => ICardLinkRes;
  getByToken: (token: string) => Promise<ICardLinkModels>;
}

const _cardLinksContext = dbContext.CardLinksContext;

const create = async (
  models: ICreateCardLinkModels,
): Promise<ICardLinkModels | null> => {
  const res = await _cardLinksContext
    .create({
      ...models,
      objectStatus: ObjectStatus.Active,
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res) {
    return res.get();
  }

  return null;
};
const update = async (
  id: number,
  models: ICreateCardLinkModels,
): Promise<boolean> => {
  const res = await _cardLinksContext
    .update(
      { ...models },
      {
        where: { id },
      },
    )
    .catch((err) => {
      logger.error(err);
    });

  if (res && res[0] === 1) {
    return true;
  } else {
    return false;
  }
};
const deleteAsync = async (id: number): Promise<boolean> => {
  const res = await _cardLinksContext
    .destroy({
      where: { id },
    })
    .catch((err) => {
      logger.error(err);
    });

  if (res === 1) {
    return true;
  } else {
    return false;
  }
};
const getByUserId = async (userId: number): Promise<ICardLinkModels[]> => {
  let option: any = {
    where: { userId },
    order: getOrderQuery(),
  };

  const res = await _cardLinksContext.findAll(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    let cards = res.map((item) => item.get());

    return cards;
  }

  return [];
};
const getByToken = async (token: string): Promise<ICardLinkModels> => {
  let option = {
    where: { token },
  };

  const res = await _cardLinksContext.findOne(option).catch((err) => {
    logger.error(err);
  });

  if (res) {
    let cards = res.get();

    return cards;
  }

  return null;
};
const toModel = (item: ICardLinkModels): ICardLinkRes => {
  return {
    id: item.id,
    userId: item.userId,
    bankCode: item.bankCode,
    bankType: item.bankType,
    cardLinkCode: item.cardLinkCode,
    cardNumber: item.cardNumber,
    method: item.method,
    token: item.token,
  };
};

const CardLinkService: ICardLinkService = {
  create,
  update,
  delete: deleteAsync,
  getByUserId,
  getByToken,
  toModel,
};

export default CardLinkService;
