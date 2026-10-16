import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ResourcesService } from '../resources/resources.service';
import { ResourceQueryDto } from '../resources/dto/resource-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

export const RESOURCE_TYPES = ['website', 'youtube', 'telegram', 'book', 'movie'] as const;

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly resources: ResourcesService,
  ) {}

  async getStats() {
    const [total, published, featured, categories, tags, byTypeGroups] = await Promise.all([
      this.prisma.resource.count(),
      this.prisma.resource.count({ where: { published: true } }),
      this.prisma.resource.count({ where: { featured: true } }),
      this.prisma.category.count(),
      this.prisma.tag.count(),
      this.prisma.resource.groupBy({ by: ['type'], _count: { _all: true } }),
    ]);

    const byType: Record<string, number> = {};
    for (const row of byTypeGroups) {
      byType[row.type] = row._count._all;
    }

    return {
      resources: {
        total,
        published,
        unpublished: total - published,
        featured,
      },
      byType,
      categories,
      tags,
    };
  }

  listResources(query: ResourceQueryDto) {
    return this.resources.findAll(query, { publishedOnly: false });
  }

  getResource(id: string) {
    return this.resources.findOne(id, { publishedOnly: false });
  }

  toggleResource(id: string, field: 'featured' | 'published') {
    return this.resources.toggle(id, field);
  }

  async getProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, username: true, createdAt: true, updatedAt: true },
    });
    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }
    return admin;
  }

  async changePassword(adminId: string, dto: ChangePasswordDto) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin not found.');
    }
    const ok = await bcrypt.compare(dto.currentPassword, admin.passwordHash);
    if (!ok) {
      throw new BadRequestException('Current password is incorrect.');
    }
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.admin.update({ where: { id: adminId }, data: { passwordHash } });
    return { success: true };
  }
}
