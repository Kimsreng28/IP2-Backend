import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto";

@Injectable()
export class PermissionAdminService{
    
    constructor(private prisma: PrismaService) {}

    async getRolesWithUserCounts() {
        try {
            // Get counts for all roles
            const roleStats = await this.prisma.user.groupBy({
            by: ['role'],
            _count: {
                role: true
            },
            _max: {
                updated_at: true
            }
            });

            // Transform into desired format
            const roles = [
            {
                id: 1,
                name: 'Admin',
                icon: '👤',
                total: roleStats.find(r => r.role === RoleEnum.ADMIN)?._count.role || 0,
                updateDate: roleStats.find(r => r.role === RoleEnum.ADMIN)?._max.updated_at || new Date()
            },
            {
                id: 2,
                name: 'Customer',
                icon: '🔍',
                total: roleStats.find(r => r.role === RoleEnum.CUSTOMER)?._count.role || 0,
                updateDate: roleStats.find(r => r.role === RoleEnum.CUSTOMER)?._max.updated_at || new Date()
            },
            {
                id: 3,
                name: 'Vendor',
                icon: '🏷️',
                total: roleStats.find(r => r.role === RoleEnum.VENDOR)?._count.role || 0,
                updateDate: roleStats.find(r => r.role === RoleEnum.VENDOR)?._max.updated_at || new Date()
            }
            ];

            return {
            data: roles,
            stats: {
                totalUsers: roles.reduce((sum, role) => sum + role.total, 0),
                lastUpdated: roleStats.reduce((latest, item) => {
                return (!latest || item._max.updated_at > latest) 
                    ? item._max.updated_at 
                    : latest;
                }, null as Date | null)
            }
            };
        } catch (err) {
            throw new BadRequestException(`Could not fetch role statistics: ${err.message}`);
        }
    }

    async getUsersByRole(
        roleId: number,
        key?: string,
        sortBy: 'created_at' | 'updated_at' | 'first_name' | 'last_name' = 'updated_at',
        sortOrder: 'asc' | 'desc' = 'desc',
        page: number = 1,
        limit: number = 10
        ) {
        // Validate and sanitize pagination parameters
        const pageNumber = isNaN(page) || page < 1 ? 1 : Math.floor(page);
        const limitNumber = isNaN(limit) || limit < 1 ? 10 : Math.floor(limit);

        // Determine role from ID
        let role: RoleEnum;
        switch(roleId) {
            case 1: role = RoleEnum.ADMIN; break;
            case 2: role = RoleEnum.CUSTOMER; break;
            case 3: role = RoleEnum.VENDOR; break;
            default: throw new BadRequestException('Invalid role ID');
        }

        const where: any = { role };

        if (key) {
            where.OR = [
            { first_name: { contains: key, mode: 'insensitive' } },
            { last_name: { contains: key, mode: 'insensitive' } },
            { email: { contains: key, mode: 'insensitive' } }
            ];
        }

        try {
            const [users, totalCount, roleDetails] = await Promise.all([
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
                skip: (pageNumber - 1) * limitNumber,
                take: limitNumber
            }),
            this.prisma.user.count({ where }),
            this.prisma.role.findUnique({
                where: { id: roleId },
                select: {
                name: true,
                }
            })
            ]);

            const lastUpdated = await this.prisma.user.aggregate({
            where,
            _max: { updated_at: true }
            });

            return {
            role: roleDetails, // Role details
            users: {
                data: users,
                pagination: {
                total: totalCount,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalCount / limitNumber)
                },
                lastUpdated: lastUpdated._max.updated_at
            }
            };
        } catch (err) {
            throw new BadRequestException(`Could not fetch users for role: ${err.message}`);
        }
    }

   
}