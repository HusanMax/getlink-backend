import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthAdmin } from '../../common/decorators/current-admin.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'insecure-fallback-secret',
    });
  }

  validate(payload: JwtPayload): AuthAdmin {
    if (!payload?.sub || !payload?.username) {
      throw new UnauthorizedException('Invalid token payload.');
    }
    return { id: payload.sub, username: payload.username };
  }
}
