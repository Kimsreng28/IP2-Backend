import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto";

@Injectable()
export class SettingAdminService{
    
    constructor(private prisma: PrismaService) {}
    async getCategories(
    key?: string,
    sortBy: 'id' | 'name' = 'id',
    sortOrder: 'asc' | 'desc' = 'asc',
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const where: any = {};
      
      if (key) {
        where.OR = [
          { name: { contains: key, mode: 'insensitive' } }
        ];
      }

      const [categories, totalCount] = await Promise.all([
        this.prisma.category.findMany({
          where,
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                products: true,
                discounts: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: (page - 1) * limit,
          take: limit
        }),
        this.prisma.category.count({ where })
      ]);

      return {
        data: categories,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (err) {
      throw new BadRequestException(`Could not fetch categories: ${err.message}`);
    }
  }

  // GET Single Category
  async getCategoryById(id: number) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            select: {
              id: true,
              name: true
            },
            take: 5 // Just get first 5 products
          },
          discounts: {
            take: 5 // Just get first 5 discounts
          }
        }
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      return category;
    } catch (err) {
      this.handleError(err);
    }
  }

  // CREATE Category
  async createCategory(dto: CreateCategoryDto) {
    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name
        },
        select: {
          id: true,
          name: true
        }
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new BadRequestException('Category name already exists');
      }
      this.handleError(err);
    }
  }

  // UPDATE Category
  async updateCategory(id: number, dto: UpdateCategoryDto) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          name: dto.name
        },
        select: {
          id: true,
          name: true
        }
      });
    } catch (err) {
      if (err.code === 'P2002') {
        throw new BadRequestException('Category name already exists');
      }
      if (err.code === 'P2025') {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      this.handleError(err);
    }
  }

  // DELETE Category
  async deleteCategory(id: number) {
    try {
      // First check if category has any products or discounts
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              products: true,
              discounts: true
            }
          }
        }
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      if (category._count.products > 0 || category._count.discounts > 0) {
        throw new BadRequestException(
          'Cannot delete category with associated products or discounts'
        );
      }

      return await this.prisma.category.delete({
        where: { id },
        select: { id: true, name: true }
      });
    } catch (err) {
      this.handleError(err);
    }
  }

  private handleError(err: any) {
    if (err instanceof NotFoundException || err instanceof BadRequestException) {
      throw err;
    }
    throw new BadRequestException(err.message);
  }
}