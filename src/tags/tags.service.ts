import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagQueryDto } from './dto/tag-query.dto';

const tagInclude = { _count: { select: { resources: true } } } satisfies Prisma.TagInclude;
type TagWithCount = Prisma.TagGetPayload<{ include: typeof tagInclude }>;

function serialize(tag: TagWithCount) {
  const { _count, ...rest } = tag;
  return { ...rest, resourceCount: _count.resources };
}

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: TagQueryDto) {
    const where: Prisma.TagWhereInput = query.q
      ? { name: { contains: query.q, mode: 'insensitive' } }
      : {};

    const tags = await this.prisma.tag.findMany({
      where,
      include: tagInclude,
      orderBy: { name: 'asc' },
    });
    return tags.map(serialize);
  }

  async findOne(id: string) {
    const tag = await this.prisma.tag.findUnique({ where: { id }, include: tagInclude });
    if (!tag) {
      throw new NotFoundException('Tag not found.');
    }
    return serialize(tag);
  }

  async create(dto: CreateTagDto) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    await this.ensureUnique(slug);
    const created = await this.prisma.tag.create({
      data: { name: dto.name, slug },
      include: tagInclude,
    });
    return serialize(created);
  }

  async update(id: string, dto: UpdateTagDto) {
    const existing = await this.prisma.tag.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Tag not found.');
    }
    const slug = dto.slug ? slugify(dto.slug) : dto.name ? slugify(dto.name) : existing.slug;
    if (slug !== existing.slug) {
      await this.ensureUnique(slug, id);
    }
    const updated = await this.prisma.tag.update({
      where: { id },
      data: { name: dto.name ?? existing.name, slug },
      include: tagInclude,
    });
    return serialize(updated);
  }

  async remove(id: string) {
    const existing = await this.prisma.tag.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      throw new NotFoundException('Tag not found.');
    }
    await this.prisma.tag.delete({ where: { id } });
    return { success: true, id };
  }

  private async ensureUnique(slug: string, ignoreId?: string) {
    const duplicate = await this.prisma.tag.findFirst({
      where: { slug, ...(ignoreId ? { NOT: { id: ignoreId } } : {}) },
      select: { id: true },
    });
    if (duplicate) {
      throw new ConflictException(`A tag with slug "${slug}" already exists.`);
    }
  }
}
