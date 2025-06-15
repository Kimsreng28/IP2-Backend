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
        sortByPrice: 'asc' | 'desc',
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
                        total_amount: sortByPrice,
                    },
                    include: {
                        user: true,
                        order_items: {
                            include: { product: true },
                        },
                        vendor_orders: true,
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

    // async getRecentOrder(vendorId: number): Promise<{
    //     message: string;
    //     recentOrder: any;
    // }> {
    //     try {
    //         // Validate if vendor exists
    //         const vendorExists = await this.prisma.vendor.findUnique({
    //             where: { id: vendorId },
    //         });

    //         if (!vendorExists) {
    //             throw new NotFoundException('Vendor not found');
    //         }

    //         const topProducts = await this.prisma.orderItem.groupBy({
    //             by: ['product_id'],
    //             _sum: {
    //                 quantity: true,
    //             },
    //             where: {
    //                 order: {
    //                     vendor_orders: {
    //                         some: {
    //                             vendor_id: vendorId,
    //                         },
    //                     },
    //                 },
    //                 product: {
    //                     vendor_products: {
    //                         some: {
    //                             vendor_id: vendorId,
    //                         },
    //                     },
    //                 },
    //             },
    //             orderBy: {
    //                 _sum: {
    //                     quantity: 'desc',
    //                 },
    //             },
    //             take: 5,
    //         });

    //         if (!topProducts.length) {
    //             return {
    //                 message: 'No recent orders found for this vendor',
    //                 recentOrder: [],
    //             };
    //         }

    //         const productIds = topProducts.map((p) => p.product_id);

    //         const products = await this.prisma.product.findMany({
    //             where: {
    //                 id: { in: productIds },
    //             },
    //             select: {
    //                 id: true,
    //                 name: true,
    //                 price: true,
    //             },
    //         });

    //         const recentOrder = topProducts.map((tp) => {
    //             const product = products.find((p) => p.id === tp.product_id);
    //             const totalOrder = tp._sum.quantity || 0;
    //             const totalAmount = product ? product.price * totalOrder : 0;

    //             return {
    //                 product_id: tp.product_id,
    //                 product_name: product?.name || 'Unknown',
    //                 product_price: product?.price || 0,
    //                 totalOrder,
    //                 totalAmount,
    //             };
    //         });

    //         return {
    //             message: 'Top 5 recent vendor product orders fetched successfully',
    //             recentOrder,
    //         };
    //     } catch (error) {
    //         console.error('Error in getRecentOrder:', error);

    //         if (error instanceof NotFoundException) {
    //             throw error;
    //         }

    //         throw new InternalServerErrorException('Failed to fetch recent vendor orders');
    //     }
    // }

    // async getNewProducts(authId: number): Promise<{
    //     message: string;
    //     newProducts: VendorProduct[];
    // }> {
    //     try {
    //         // Get vendor ID using authId
    //         const vendor = await this.prisma.vendor.findUnique({
    //             where: { user_id: authId },
    //             select: { id: true },
    //         });

    //         if (!vendor) {
    //             throw new NotFoundException('Vendor not found');
    //         }

    //         // Get the 2 most recent vendor products
    //         const newProducts = await this.prisma.vendorProduct.findMany({
    //             where: {
    //                 vendor_id: vendor.id,
    //             },
    //             orderBy: {
    //                 created_at: 'desc',
    //             },
    //             take: 2,
    //             include: {
    //                 product: true, // optionally include product details
    //             },
    //         });

    //         return {
    //             message: 'Newest vendor products fetched successfully',
    //             newProducts,
    //         };
    //     } catch (error) {
    //         console.error('Error in getNewProducts:', error);

    //         if (error instanceof NotFoundException) {
    //             throw error;
    //         }

    //         throw new InternalServerErrorException('Failed to fetch new products');
    //     }
    // }

}
