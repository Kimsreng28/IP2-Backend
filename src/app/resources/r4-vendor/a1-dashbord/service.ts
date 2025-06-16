// ===========================================================================>> Core Library
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaClient, VendorProduct } from '@prisma/client';

@Injectable()
export class DashboardService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getTotal(authId: number): Promise<{
        message: string;
        totalVendor: number;
        totalProduct: number;
        totalSales: number;
    }> {
        try {
            const vendor = await this.prisma.vendor.findUnique({
                where: { user_id: authId },
                select: { id: true },
            });

            if (!vendor) {
                throw new NotFoundException('Vendor not found');
            }

            const [totalVendor, totalProduct, result] = await Promise.all([
                this.prisma.vendor.count(),
                this.prisma.vendorProduct.count({
                    where: { vendor_id: vendor.id },
                }),
                this.prisma.order.aggregate({
                    _sum: {
                        total_amount: true,
                    },
                    where: {
                        vendor_id: vendor.id,
                        payment_status: 'paid',
                    },
                }),
            ]);

            const totalSales = result._sum.total_amount || 0;

            return {
                message: 'Total counts retrieved successfully',
                totalVendor,
                totalProduct,
                totalSales,
            };
        } catch (error) {
            console.error('Error in getTotal:', error);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to retrieve totals');
        }
    }

    async getRecentOrder(vendorId: number): Promise<{
        message: string;
        recentOrder: any;
    }> {
        try {
            // Validate if vendor exists
            const vendorExists = await this.prisma.vendor.findUnique({
                where: { user_id: vendorId },
                select: { id: true },
            });

            if (!vendorExists) {
                throw new NotFoundException('Vendor not found');
            }

            const topProducts = await this.prisma.orderItem.groupBy({
                by: ['product_id'],
                _sum: {
                    quantity: true,
                },
                where: {
                    order: {
                        vendor_orders: {
                            some: {
                                vendor_id: vendorId,
                            },
                        },
                    },
                    product: {
                        vendor_products: {
                            some: {
                                vendor_id: vendorId,
                            },
                        },
                    },
                },
                orderBy: {
                    _sum: {
                        quantity: 'desc',
                    },
                },
                take: 5,
            });

            if (!topProducts.length) {
                return {
                    message: 'No recent orders found for this vendor',
                    recentOrder: [],
                };
            }

            const productIds = topProducts.map((p) => p.product_id);

            const products = await this.prisma.product.findMany({
                where: {
                    id: { in: productIds },
                },
                select: {
                    id: true,
                    name: true,
                    price: true,
                },
            });

            const recentOrder = topProducts.map((tp) => {
                const product = products.find((p) => p.id === tp.product_id);
                const totalOrder = tp._sum.quantity || 0;
                const totalAmount = product ? product.price * totalOrder : 0;

                return {
                    product_id: tp.product_id,
                    product_name: product?.name || 'Unknown',
                    product_price: product?.price || 0,
                    totalOrder,
                    totalAmount,
                };
            });

            return {
                message: 'Top 5 recent vendor product orders fetched successfully',
                recentOrder,
            };
        } catch (error) {
            console.error('Error in getRecentOrder:', error);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to fetch recent vendor orders');
        }
    }

    async getNewProducts(authId: number): Promise<{
        message: string;
        newProducts: VendorProduct[];
    }> {
        try {
            // Get vendor ID using authId
            const vendor = await this.prisma.vendor.findUnique({
                where: { user_id: authId },
                select: { id: true },
            });

            if (!vendor) {
                throw new NotFoundException('Vendor not found');
            }

            // Get the 2 most recent vendor products
            const newProducts = await this.prisma.vendorProduct.findMany({
                where: {
                    vendor_id: vendor.id,
                },
                orderBy: {
                    created_at: 'desc',
                },
                take: 2,
                include: {
                    product: true, // optionally include product details
                },
            });

            return {
                message: 'Newest vendor products fetched successfully',
                newProducts,
            };
        } catch (error) {
            console.error('Error in getNewProducts:', error);

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new InternalServerErrorException('Failed to fetch new products');
        }
    }

}
