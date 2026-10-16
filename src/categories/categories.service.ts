import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { slugify } from '../common/utils/slugify';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';

const categoryInclude = {
  _count: { select: { resources: true } },
} satisfies Prisma.CategoryInclude;

type CategoryWithCount = Prisma.CategoryGetPayload<{ include: typeof categoryInclude }>;

function serialize(category: CategoryWithCount) {
  const { _count, ...rest } = category;
  return { ...rest, resourceCount: _count.resources };
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: CategoryQueryDto) {
    const where: Prisma.CategoryWhereInput = {
      ...(query.type ? { type: query.type } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const categories = await this.prisma.category.findMany({
      where,
      include: categoryInclude,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
    return categories.map(serialize);
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: categoryInclude,
    });
    if (!category) {
      throw new NotFoundException('Category not found.');
    }
    return serialize(category);
  }

  async create(dto: CreateCategoryDto) {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    await this.ensureUnique(dto.type, slug);
    const created = await this.prisma.category.create({
      data: { ...dto, slug },
      include: categoryInclude,
    });
    return serialize(created);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Category not found.');
    }
    const type = dto.type ?? existing.type;
    const slug = dto.slug ? slugify(dto.slug) : dto.name ? slugify(dto.name) : existing.slug;

    if (type !== existing.type || slug !== existing.slug) {
      await this.ensureUnique(type, slug, id);
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: { ...dto, slug, type },
      include: categoryInclude,
    });
    return serialize(updated);
  }

  async remove(id: string, force = false) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: categoryInclude,
    });
    if (!category) {
      throw new NotFoundException('Category not found.');
    }

    const count = category._count.resources;
    if (count > 0 && !force) {
      throw new ConflictException({
        message: `This category still has ${count} resource(s). Reassign or delete them, or confirm to remove the category and unassign its resources.`,
        resourceCount: count,
      });
    }

    await this.prisma.category.delete({ where: { id } });
    return { success: true, id, unassignedResources: count };
  }

  private async ensureUnique(type: string, slug: string, ignoreId?: string) {
    const duplicate = await this.prisma.category.findFirst({
      where: { type, slug, ...(ignoreId ? { NOT: { id: ignoreId } } : {}) },
      select: { id: true },
    });
    if (duplicate) {
      throw new ConflictException(`A category with slug "${slug}" already exists for type "${type}".`);
    }
  }
}
