import AdvertisementVideoControllers from '../controllers/advertisement.video.controllers';
import express from 'express';

const AdvertisementVideoRouter = express.Router();

const ADVERTISEMENT_VIDEO_PATH = '/adv-video';

// gets
AdvertisementVideoRouter.get(
  `${ADVERTISEMENT_VIDEO_PATH}`,
  AdvertisementVideoControllers.gets,
);
// create
AdvertisementVideoRouter.post(
  `${ADVERTISEMENT_VIDEO_PATH}`,
  AdvertisementVideoControllers.create,
);
// update
AdvertisementVideoRouter.put(
  `${ADVERTISEMENT_VIDEO_PATH}/:id`,
  AdvertisementVideoControllers.update,
);
// delete
AdvertisementVideoRouter.delete(
  `${ADVERTISEMENT_VIDEO_PATH}/:id`,
  AdvertisementVideoControllers.deleteAsync,
);

export default AdvertisementVideoRouter;
