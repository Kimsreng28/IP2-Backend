// ===========================================================================>> Core Library
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Order, Prisma, PrismaClient, VendorProduct } from '@prisma/client';

@Injectable()
export class OrderHistoryService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getOrdersHistories(
        authId: number,
        page: number,
        limit: number,
        sort: 'asc' | 'desc',
        keySearch?: string,
    ): Promise<{
        ordersHistories: Order[];
        totalItems: number;
        page: number;
        totalPages: number;
    }> {
        try {
            const vendor = await this.prisma.vendor.findUnique({
                where: { user_id: authId },
                select: { id: true },
            });

            if (!vendor) {
                throw new NotFoundException('Vendor not found');
            }

            const skip = (page - 1) * limit;

            // Build the where condition
            const whereCondition: Prisma.OrderWhereInput = {
                vendor_id: vendor.id,
            };

            // Add search conditions if keySearch is provided
            if (keySearch) {
                whereCondition.OR = [
                    { shipping_address: { contains: keySearch } },
                    {
                        user: {
                            OR: [
                                { first_name: { contains: keySearch } },
                                { last_name: { contains: keySearch } },
                                { email: { contains: keySearch, } }
                            ]
                        }
                    }
                ];
            }

            const [ordersHistories, totalItems] = await this.prisma.$transaction([
                this.prisma.order.findMany({
                    where: whereCondition,
                    skip,
                    take: limit,
                    orderBy: {
                        id: sort,
                    },
                    include: {
                        user: {
                            select: {
                                first_name: true,
                                last_name: true,
                                email: true,
                                avatar: true
                            }
                        },
                        vendor_orders: true,
                        order_items: {
                            include: { product: true },
                        },
                    },
                }),
                this.prisma.order.count({
                    where: whereCondition,
                }),
            ]);

            const totalPages = Math.ceil(totalItems / limit);

            return {
                ordersHistories,
                totalItems,
                page,
                totalPages,
            };
        } catch (error) {
            console.error('Error in getOrdersHistories:', error);
            throw new InternalServerErrorException('Failed to fetch order histories');
        }
    }

    async getOrderHistory(
        authId: number,
        orderId: number,
    ): Promise<{
        orderHistory: Order;
    }> {
        try {
            // First verify the vendor exists
            const vendor = await this.prisma.vendor.findUnique({
                where: { user_id: authId },
                select: { id: true },
            });

            if (!vendor) {
                throw new NotFoundException('Vendor not found');
            }

            // Get the specific order that belongs to this vendor
            const orderHistory = await this.prisma.order.findFirst({
                where: {
                    id: orderId,
                    vendor_id: vendor.id,
                },
                include: {
                    user: {
                        select: {
                            first_name: true,
                            last_name: true,
                            email: true,
                            avatar: true
                        }
                    },
                    vendor_orders: true,
                    order_items: {
                        include: { product: true },
                    },
                },
            });

            if (!orderHistory) {
                throw new NotFoundException('Order not found or does not belong to this vendor');
            }

            return {
                orderHistory,
            };
        } catch (error) {
            console.error('Error in getOrderHistory:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to fetch order history');
        }
    }

}
