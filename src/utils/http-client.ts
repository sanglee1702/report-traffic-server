import axios, { AxiosInstance, AxiosResponse, ResponseType } from 'axios';
import qs from 'qs';
import logger from '../logs/logger';

const axiosInstance = (
  baseURL: string,
  token?: string,
  contentType: string = 'application/json',
  responseType: ResponseType = 'json',
): AxiosInstance => {
  const instance = axios.create({
    baseURL: baseURL,
    headers: {
      'Content-Type': contentType,
      Authorization: `Bearer ${token}`,
    },
    responseType: responseType,
  });

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      logger.error(error);
      return Promise.reject(error);
    },
  );
  return instance;
};

export const getAsync = (
  baseURL: string,
  url: string,
  params?: { [key: string]: any },
  token?: string,
): Promise<AxiosResponse> => {
  if (params?.hasOwnProperty('keyword')) {
    params.keyword = params.keyword.trim();
  }
  return axiosInstance(baseURL, token).get(url, {
    params: params,
    paramsSerializer: function (params) {
      return qs.stringify(params, { arrayFormat: 'repeat' });
    },
  });
};

export const postAsync = (
  baseURL: string,
  url: string,
  json: object,
  token?: string,
): Promise<AxiosResponse> => {
  return axiosInstance(baseURL, token).post(url, json);
};

export const putAsync = (
  baseURL: string,
  url: string,
  json?: object,
  token?: string,
): Promise<AxiosResponse> => {
  return axiosInstance(baseURL, token).put(url, json);
};

export const deleteAsync = (
  baseURL: string,
  url: string,
  token?: string,
): Promise<AxiosResponse> => {
  return axiosInstance(baseURL, token).delete(url);
};
