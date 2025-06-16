import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateCategoryDto, CreatePaymentDto, UpdateCategoryDto, UpdatePaymentDto } from "./dto";

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
        if (key) {
            where.OR = [
            { name: { contains: key, mode: 'insensitive' } },
            ];
        }
        console.log(key)


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
        console.log(categories)
        
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
    async getPayments(
        userId?: number,
        orderId?: number,
        status?: string,
        sortBy: 'created_at' | 'amount' = 'created_at',
        sortOrder: 'asc' | 'desc' = 'desc',
        page: number = 1,
        limit: number = 10
    ) {
        try {
        const where: any = {};
        
        if (userId) where.user_id = userId;
        if (orderId) where.order_id = orderId;
        if (status) where.status = status;

        const [payments, totalCount] = await Promise.all([
            this.prisma.payment.findMany({
            where,
            select: {
                id: true,
                uuid: true,
                payment_method: true,
                payment_gateway: true,
                status: true,
                created_at: true,
                transaction_id: true,
                user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true
                    }
                },
                order: {
                    select: {
                        id: true,
                        order_date: true,
                        status: true,
                        payment_status: true,
                        total_amount: true,
                        created_at: true,
                        shipping_address: true
                    }
                }
            },
            orderBy: { [sortBy]: sortOrder },
            skip: (page - 1) * limit,
            take: limit
            }),
            this.prisma.payment.count({ where })
        ]);

        return {
            data: payments,
            pagination: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
            }
        };
        } catch (err) {
        throw new BadRequestException(`Could not fetch payments: ${err.message}`);
        }
    }

    // GET Single Payment
    async getPaymentById(id: number) {
        try {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: {
            user: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true
                }
            },
            order: {
                select: {
                    id: true,
                    order_date: true,
                    status: true,
                    payment_status: true,
                    total_amount: true,
                    created_at: true,
                    shipping_address: true
                }
            },
            credit_card: {
                select: {
                    id: true,
                    card_last4: true,
                    card_brand: true
                }
            }
            }
        });

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
        } catch (err) {
        this.handleError(err);
        }
    }

    // GET Payment by UUID
    async getPaymentByUuid(uuid: string) {
        try {
        const payment = await this.prisma.payment.findUnique({
            where: { uuid },
            include: {
            user: {
                select: {
                id: true,
                first_name: true,
                last_name: true
                }
            }
            }
        });

        if (!payment) {
            throw new NotFoundException(`Payment with UUID ${uuid} not found`);
        }
        return payment;
        } catch (err) {
        this.handleError(err);
        }
    }

    // CREATE Payment
    async createPayment(dto: CreatePaymentDto) {
        try {
        return await this.prisma.payment.create({
            data: {
                order_id: dto.order_id,
                user_id: dto.user_id,
                credit_card_id: dto.credit_card_id,
                payment_method: dto.payment_method,
                payment_gateway: dto.payment_gateway,
                transaction_id: dto.transaction_id,
                status: dto.status || 'pending',
            }
        });
        } catch (err) {
        if (err.code === 'P2002') {
            throw new BadRequestException('Transaction ID must be unique');
        }
        if (err.code === 'P2003') {
            throw new BadRequestException('Invalid user, order, or credit card reference');
        }
        this.handleError(err);
        }
    }

    // UPDATE Payment Status
    async updatePayment(id: number, dto: UpdatePaymentDto) {
        try {
        return await this.prisma.payment.update({
            where: { id },
            data: {
            status: dto.status,
            transaction_id: dto.transaction_id
            },
            select: {
                id: true,
                status: true,
                transaction_id: true,
            }
        });
        } catch (err) {
        if (err.code === 'P2002') {
            throw new BadRequestException('Transaction ID must be unique');
        }
        if (err.code === 'P2025') {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }
        this.handleError(err);
        }
    }

    // DELETE Payment (Admin only)
    async deletePayment(id: number) {
        try {
        const payment = await this.prisma.payment.findUnique({
            where: { id }
        });

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        if (payment.status === 'completed') {
            throw new BadRequestException('Cannot delete completed payment');
        }

        return await this.prisma.payment.delete({
            where: { id },
            select: { id: true, uuid: true }
        });
        } catch (err) {
        this.handleError(err);
        }
    }
}