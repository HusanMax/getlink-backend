import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ResourceQueryDto, ResourceSort } from './dto/resource-query.dto';

const resourceInclude = {
  category: { select: { id: true, name: true, slug: true, type: true, icon: true } },
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
} satisfies Prisma.ResourceInclude;

type ResourceWithRelations = Prisma.ResourceGetPayload<{ include: typeof resourceInclude }>;

function serialize(resource: ResourceWithRelations) {
  const { tags, ...rest } = resource;
  return {
    ...rest,
    tags: tags.map((t) => t.tag),
  };
}

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ResourceQueryDto, options: { publishedOnly: boolean } = { publishedOnly: true }) {
    const { page, limit, q, type, categoryId, category, tag, featured, sort } = query;

    const where: Prisma.ResourceWhereInput = {
      ...(options.publishedOnly ? { published: true } : {}),
      ...(!options.publishedOnly && typeof query.published === 'boolean'
        ? { published: query.published }
        : {}),
      ...(type ? { type } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(category ? { category: { is: { slug: category } } } : {}),
      ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
      ...(typeof featured === 'boolean' ? { featured } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { author: { contains: q, mode: 'insensitive' } },
              { category: { is: { name: { contains: q, mode: 'insensitive' } } } },
              { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
            ],
          }
        : {}),
    };

    const orderBy = this.resolveOrderBy(sort);

    const [total, items] = await this.prisma.$transaction([
      this.prisma.resource.count({ where }),
      this.prisma.resource.findMany({
        where,
        include: resourceInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: items.map(serialize),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string, options: { publishedOnly: boolean } = { publishedOnly: true }) {
    const resource = await this.prisma.resource.findFirst({
      where: { id, ...(options.publishedOnly ? { published: true } : {}) },
      include: resourceInclude,
    });
    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }
    return serialize(resource);
  }

  async create(dto: CreateResourceDto) {
    const { tagIds, metadata, ...data } = dto;
    const created = await this.prisma.resource.create({
      data: {
        ...data,
        metadata: metadata as Prisma.InputJsonValue | undefined,
        tags: tagIds?.length ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
      },
      include: resourceInclude,
    });
    return serialize(created);
  }

  async update(id: string, dto: UpdateResourceDto) {
    await this.ensureExists(id);
    const { tagIds, metadata, ...data } = dto;

    const updated = await this.prisma.resource.update({
      where: { id },
      data: {
        ...data,
        ...(metadata !== undefined ? { metadata: metadata as Prisma.InputJsonValue } : {}),
        ...(tagIds !== undefined
          ? { tags: { deleteMany: {}, create: tagIds.map((tagId) => ({ tagId })) } }
          : {}),
      },
      include: resourceInclude,
    });
    return serialize(updated);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.resource.delete({ where: { id } });
    return { success: true, id };
  }

  async toggle(id: string, field: 'featured' | 'published') {
    const current = await this.prisma.resource.findUnique({
      where: { id },
      select: { featured: true, published: true },
    });
    if (!current) {
      throw new NotFoundException('Resource not found.');
    }
    const updated = await this.prisma.resource.update({
      where: { id },
      data: { [field]: !current[field] },
      include: resourceInclude,
    });
    return serialize(updated);
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.resource.findUnique({ where: { id }, select: { id: true } });
    if (!exists) {
      throw new NotFoundException('Resource not found.');
    }
  }

  private resolveOrderBy(sort: ResourceSort): Prisma.ResourceOrderByWithRelationInput[] {
    switch (sort) {
      case 'oldest':
        return [{ createdAt: 'asc' }];
      case 'title':
        return [{ title: 'asc' }];
      case 'featured':
        return [{ featured: 'desc' }, { createdAt: 'desc' }];
      case 'newest':
      default:
        return [{ createdAt: 'desc' }];
    }
  }
}
