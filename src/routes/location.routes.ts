import LocationControllers from '../controllers/location.controllers';
import express from 'express';

const LocationRouter = express.Router();
const LOCATION_PATH = '/locations';

// provinces
LocationRouter.get(
  `${LOCATION_PATH}/provinces`,
  LocationControllers.getProvinces,
);
LocationRouter.post(
  `${LOCATION_PATH}/provinces`,
  LocationControllers.createProvince,
);
LocationRouter.put(
  `${LOCATION_PATH}/provinces`,
  LocationControllers.updateProvince,
);
LocationRouter.delete(
  `${LOCATION_PATH}/provinces/:id`,
  LocationControllers.deleteProvinceAsync,
);

// districts
LocationRouter.get(
  `${LOCATION_PATH}/districts/:provinceCode`,
  LocationControllers.getDistricts,
);
LocationRouter.post(
  `${LOCATION_PATH}/districts`,
  LocationControllers.createDistrict,
);
LocationRouter.put(
  `${LOCATION_PATH}/districts`,
  LocationControllers.updateDistrict,
);
LocationRouter.delete(
  `${LOCATION_PATH}/districts/:id`,
  LocationControllers.deleteDistrictAsync,
);

// wards
LocationRouter.get(
  `${LOCATION_PATH}/wards/:districtCode`,
  LocationControllers.getWards,
);
LocationRouter.post(
  `${LOCATION_PATH}/wards`,
  LocationControllers.createWard,
);
LocationRouter.put(
  `${LOCATION_PATH}/wards`,
  LocationControllers.updateWard,
);
LocationRouter.delete(
  `${LOCATION_PATH}/wards/:id`,
  LocationControllers.deleteWardAsync,
);

export default LocationRouter;
