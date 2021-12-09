import BannerControllers from '../controllers/banner.controllers';
import express from 'express';

const BannerRouter = express.Router();

const BANNER_PATH = '/banners';

// get banner
BannerRouter.get(`${BANNER_PATH}`, BannerControllers.getBanners);
// create
BannerRouter.post(`${BANNER_PATH}`, BannerControllers.create);
// update
BannerRouter.put(`${BANNER_PATH}/:id`, BannerControllers.update);
// delete
BannerRouter.delete(`${BANNER_PATH}/:id`, BannerControllers.deleteAsync);

export default BannerRouter;
