import * as jwt from 'jsonwebtoken';
import { envConfig } from '../config/env.config';
import { IAccountModels } from '../models/accounts.models';
import { ObjectStatus, Roles } from '../models/common/models.enum';
import { IUserModels } from '../models/users.models';
import AccountService from '../services/account.service';
import UserService from '../services/user.service';

export interface AuthUser {
  id: number | null;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  role: Roles;
  username: string;
  userId: number;
}

export interface Authenticator {
  validate(token: string): Promise<AuthUser>;
  authenticate(user: IUserModels, account: IAccountModels): string;
}

export class JWTAuthenticator implements Authenticator {
  private secret: string;

  constructor() {
    this.secret = envConfig.SALT;
  }

  public async validate(token: string): Promise<AuthUser | null> {
    try {
      const decode: any = jwt.verify(token, this.secret);

      const account = await AccountService.getById(decode.id);

      const user = await UserService.getById(decode.userId);

      if (
        !account ||
        account.token !== token ||
        account.hasExpired ||
        account.objectStatus === ObjectStatus.DeActive
      ) {
        return null;
      }

      return {
        id: account.id || null,
        email: user?.email || null,
        fullName: `${user?.firstName || ''} ${user?.lastName || ''}`,
        avatarUrl: user?.avatarUrl || null,
        phoneNumber: user?.phoneNumber || null,
        role: account.role,
        username: account.username,
        userId: user?.id,
      };
    } catch (err) {
      return null;
    }
  }

  public authenticate(user: IUserModels, account: IAccountModels): string {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`;

    return jwt.sign(
      {
        id: account.id,
        email: user.email || null,
        fullName: fullName,
        avatarUrl: user.avatarUrl || null,
        phoneNumber: user.phoneNumber || null,
        role: account.role,
        username: account.username,
        userId: user.id || null,
      },
      this.secret,
    );
  }
}
