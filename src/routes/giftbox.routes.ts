import GiftBoxControllers from '../controllers/giftbox.controllers';
import express from 'express';

const GiftBoxRouter = express.Router();

const GIFTBOX_PATH = '/giftboxs';

// open
GiftBoxRouter.get(
  `${GIFTBOX_PATH}/challenges/open`,
  GiftBoxControllers.openChallengGiftbox,
);

export default GiftBoxRouter;
