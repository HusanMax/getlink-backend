import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const admin = await this.prisma.admin.findUnique({ where: { username: dto.username } });

    // Always run a comparison to reduce user-enumeration timing differences.
    const hash = admin?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
    const ok = await bcrypt.compare(dto.password, hash);

    if (!admin || !ok) {
      throw new UnauthorizedException('Invalid username or password.');
    }

    const payload: JwtPayload = { sub: admin.id, username: admin.username };
    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      admin: { id: admin.id, username: admin.username },
    };
  }

  async me(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, username: true, createdAt: true },
    });
    if (!admin) {
      throw new UnauthorizedException('Admin account no longer exists.');
    }
    return admin;
  }
}
