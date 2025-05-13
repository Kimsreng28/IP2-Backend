import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto";

@Injectable()
export class PermissionAdminService{
    
    constructor(private prisma: PrismaService) {}

    async getUsers(
        role_id: number,
        key?: string,
        sortBy: 'created_at' | 'updated_at' | 'first_name' | 'last_name' = 'updated_at',
        sortOrder: 'asc' | 'desc' = 'desc',
        page: number = 1,
        limit: number = 10
    ) {
        let role: RoleEnum;
        switch(role_id) {
            case 1: role = RoleEnum.ADMIN; break;
            case 2: role = RoleEnum.CUSTOMER; break;
            case 3: role = RoleEnum.VENDOR; break;
            default: throw new BadRequestException('Invalid role ID');
        }

        try {
            const where: any = { role };
            
            if (key) {
                where.OR = [
                    { first_name: { contains: key, mode: 'insensitive' } },
                    { last_name: { contains: key, mode: 'insensitive' } },
                    { email: { contains: key, mode: 'insensitive' } }
                ];
            }

            const [users, totalCount, roleStats] = await Promise.all([
                this.prisma.user.findMany({
                    where,
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                        role: true,
                        status: true,
                        created_at: true,
                        updated_at: true,
                        avatar: true
                    },
                    orderBy: { [sortBy]: sortOrder },
                    skip: (page - 1) * limit,
                    take: limit
                }),
                this.prisma.user.count({ where }),
                this.prisma.user.groupBy({
                    by: ['role'],
                    _count: { role: true },
                    _max: { updated_at: true },
                    where
                })
            ]);

            return {
                data: users,
                pagination: {
                    total: totalCount,
                    page,
                    limit,
                    totalPages: Math.ceil(totalCount / limit)
                },
                stats: {
                    roleCounts: roleStats.map(item => ({
                        role: item.role,
                        count: item._count.role,
                        lastUpdated: item._max.updated_at
                    })),
                    lastUpdated: roleStats.reduce((latest: Date | null, item) => {
                        const itemDate = item._max.updated_at;
                        if (!itemDate) return latest;
                        return (!latest || itemDate > latest) ? itemDate : latest;
                    }, null as Date | null)
                }
            };
        } catch (err) {
            if (err instanceof NotFoundException) {
                throw err;
            }
            throw new BadRequestException(`Could not fetch users: ${err.message}`);
        }
    }
    async getUserById(id: number) {
        try {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
            addresses: true,
            vendor: true,
            admin: true,
            customer: true
            }
        });

        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        return user;
        } catch (err) {
        this.handleError(err);
        }
    }

    // POST (Create)
    async createUser(dto: CreateUserDto) {
        try {
        return await this.prisma.user.create({
            data: {
            ...dto,
            email_verified: dto.email_verified ?? false,
            status: dto.status ?? 'ACTIVE'
            },
            select: { id: true, email: true, role: true } // Return only essential fields
        });
        } catch (err) {
        if (err.code === 'P2002') {
            throw new BadRequestException('Email already exists');
        }
        this.handleError(err);
        }
    }

    // PATCH (Update)
    async updateUser(id: number, dto: UpdateUserDto) {
        try {
        return await this.prisma.user.update({
            where: { id },
            data: {
            ...dto,
            updated_at: new Date() // Force update timestamp
            },
            select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            updated_at: true
            }
        });
        } catch (err) {
        this.handleError(err);
        }
    }

    // DELETE
    async deleteUser(id: number) {
        try {
        // Soft delete example (set deleted_at)
        return await this.prisma.user.update({
            where: { id },
            data: { deleted_at: new Date() },
            select: { id: true, email: true }
        });
        
        // For hard delete:
        // return await this.prisma.user.delete({ where: { id } });
        } catch (err) {
        if (err.code === 'P2025') {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        this.handleError(err);
        }
    }

    private handleError(err: any) {
        if (err instanceof NotFoundException) throw err;
        throw new BadRequestException(err.message);
    }

}