import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';


@Injectable()
export class AdminRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-admin-refresh') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        let jwt = null
        if (req && req.cookies) {
            jwt = req.cookies['adminRefreshToken']
            console.log(jwt)
        }
        
        return jwt
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req?.cookies['adminRefreshToken']

    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');

    return {
      ...payload,
      refreshToken,
    };
  }
}
