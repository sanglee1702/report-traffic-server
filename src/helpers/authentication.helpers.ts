import { Request } from 'express';
import { JWTAuthenticator } from '../authentication';
import logger from '../logs/logger';
import { Roles } from '../models/common/models.enum';

const _authenticator = new JWTAuthenticator();

export const getTokenHeader = (request: Request): string | null => {
  const authorization = request.headers.authorization;

  if (authorization) {
    const token = authorization.split(' ')[1];

    if (token) {
      return token;
    }
  }

  return null;
};

export const checkAuthentication = async (request: Request, role?: Roles[]) => {
  const token = getTokenHeader(request);

  if (!token) {
    logger.error({
      ...request.headers,
      ...request.body,
      message: '401 Unauthorized',
    });
    return null;
  }

  const auth = await _authenticator.validate(token);

  let matchRole = true;

  if (auth && role && role.length) {
    matchRole = role.includes(auth.role);
  }

  if (!auth || !matchRole) {
    logger.error({
      ...request.headers,
      ...request.body,
      message: '401 Unauthorized',
    });
    return null;
  }

  return auth;
};
