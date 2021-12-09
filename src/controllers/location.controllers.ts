import { Request, Response } from 'express';
import { checkAuthentication } from '../helpers/authentication.helpers';
import { Roles } from '../models/common/models.enum';
import { ICreateDistrictModels } from '../models/district.models';
import { ICreateProvinceModels } from '../models/province.models';
import { ICreateWardModels } from '../models/ward.models';
import DistrictService from '../services/district.service';
import ProvinceService from '../services/province.service';
import WardService from '../services/ward.service';
import { ReporingError, UnauthorizedError } from '../utils/error';

// provinces
const getProvinces = async (
  _: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const provinces = await ProvinceService.getList();

  return result.send(provinces);
};

const createProvince = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateProvinceModels = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage = validateProvinceData(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateProvinceModels = {
    code: data.code,
    name: data.name,
    level: data.level,
    createdBy: authUser.id.toString(),
  };

  const province = await ProvinceService.create(params);

  if (!province) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send(province);
};

const updateProvince = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateProvinceModels & { id: number } = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const province = await ProvinceService.getById(data.id);

  if (!province) {
    return result.status(400).send({
      message: 'Province not found',
    });
  }

  const errorMessage = validateProvinceData(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateProvinceModels = {
    code: data.code,
    name: data.name,
    level: data.level || null,
    updatedBy: authUser.id.toString(),
  };

  const hasUpdate = await ProvinceService.update(data.id, params);

  if (!hasUpdate) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send(hasUpdate);
};

const deleteProvinceAsync = async (
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

  const hasDelete = await ProvinceService.delete(id);

  if (!hasDelete) {
    return result.status(400).send({ message: 'Delete province has error' });
  }

  return result.send({ message: 'Delete province successfully' });
};

const validateProvinceData = (data: ICreateProvinceModels) => {
  const errorDatas = {
    name: 'name is required',
    code: 'code is required',
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  return message;
};

// districts
const getDistricts = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const provinceCode = request.params.provinceCode;

  const districts = await DistrictService.getByProvinceCode(provinceCode);

  return result.send(districts);
};

const createDistrict = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateDistrictModels = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage = validateDistrictData(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateDistrictModels = {
    code: data.code,
    name: data.name,
    level: data.level || null,
    provinceCode: data.provinceCode,
    createdBy: authUser.id.toString(),
  };

  const district = await DistrictService.create(params);

  if (!district) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send(district);
};

const updateDistrict = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateDistrictModels & { id: number } = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const district = await DistrictService.getById(data.id);

  if (!district) {
    return result.status(400).send({
      message: 'District not found',
    });
  }

  const errorMessage = validateDistrictData(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateDistrictModels = {
    provinceCode: data.provinceCode,
    code: data.code,
    name: data.name,
    level: data.level || null,
    updatedBy: authUser.id.toString(),
  };

  const hasUpdate = await DistrictService.update(data.id, params);

  if (!hasUpdate) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send(hasUpdate);
};

const deleteDistrictAsync = async (
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

  const hasDelete = await DistrictService.delete(id);

  if (!hasDelete) {
    return result.status(400).send({ message: 'Delete district has error' });
  }

  return result.send({ message: 'Delete district successfully' });
};

const validateDistrictData = (data: ICreateDistrictModels) => {
  const errorDatas = {
    provinceCode: 'provinceCode is required',
    name: 'name is required',
    code: 'code is required',
  };

  let message: string[] = [];

  Object.keys(errorDatas).forEach((key) => {
    if (!data[key]) {
      message.push(errorDatas[key]);
    }
  });

  return message;
};

// wards
const getWards = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const districtCode = request.params.districtCode;

  const wards = await WardService.getByDistrictCode(districtCode);

  return result.send(wards);
};

const createWard = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateWardModels = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const errorMessage = validateWardData(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateWardModels = {
    code: data.code,
    name: data.name,
    level: data.level || null,
    districtCode: data.districtCode,
    createdBy: authUser.id.toString(),
  };

  const ward = await WardService.create(params);

  if (!ward) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send(ward);
};

const updateWard = async (
  request: Request,
  result: Response,
): Promise<Response<any, Record<string, any>>> => {
  const data: ICreateWardModels & { id: number } = request.body;

  const authUser = await checkAuthentication(request, [
    Roles.SuperAdmin,
    Roles.Admin,
  ]);
  if (!authUser) {
    return result.status(401).send(new UnauthorizedError().toModel());
  }

  const district = await WardService.getById(data.id);

  if (!district) {
    return result.status(400).send({
      message: 'Ward not found',
    });
  }

  const errorMessage = validateWardData(data);

  if (errorMessage.length) {
    return result.status(400).send({
      message: errorMessage.join(', '),
    });
  }

  const params: ICreateWardModels = {
    districtCode: data.districtCode,
    code: data.code,
    name: data.name,
    level: data.level || null,
    updatedBy: authUser.id.toString(),
  };

  const hasUpdate = await WardService.update(data.id, params);

  if (!hasUpdate) {
    return result.status(500).send(new ReporingError().toModel());
  }

  return result.send(hasUpdate);
};

const deleteWardAsync = async (
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

  const hasDelete = await WardService.delete(id);

  if (!hasDelete) {
    return result.status(400).send({ message: 'Delete ward has error' });
  }

  return result.send({ message: 'Delete ward successfully' });
};

const validateWardData = (data: ICreateWardModels) => {
  const errorDatas = {
    districtCode: 'districtCode is required',
    name: 'name is required',
    code: 'code is required',
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
  getProvinces,
  getDistricts,
  getWards,
  createProvince,
  updateProvince,
  deleteProvinceAsync,
  createDistrict,
  updateDistrict,
  deleteDistrictAsync,
  createWard,
  updateWard,
  deleteWardAsync,
};
