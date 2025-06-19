// ===========================================================================>> Core Library
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaClient, Product, VendorProduct } from '@prisma/client';
import dayjs from 'dayjs';

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

    async getChartData(authId: number): Promise<{
        message: string;
        chartData: { month: string; totalSales: number; percent: number }[];
    }> {
        const now = new Date();
        const currentYear = now.getFullYear();

        const vendor = await this.prisma.vendor.findUnique({
            where: { user_id: authId },
            select: { id: true },
        });

        if (!vendor) {
            throw new NotFoundException('Vendor not found');
        }

        const orders = await this.prisma.order.findMany({
            where: {
                vendor_id: vendor.id,
                payment_status: 'paid',
                order_date: {
                    gte: new Date(currentYear, 0, 1),
                    lte: new Date(currentYear, 11, 31, 23, 59, 59),
                },
            },
            select: {
                order_date: true,
                total_amount: true,
            },
        });

        const monthlyTotals: { [key: number]: number } = {};

        for (const order of orders) {
            const month = order.order_date.getMonth(); // 0 = Jan
            monthlyTotals[month] = (monthlyTotals[month] || 0) + order.total_amount;
        }

        const monthlySalesArray = Array.from({ length: 12 }, (_, i) => monthlyTotals[i] || 0);
        const maxMonthlySales = Math.max(...monthlySalesArray);
        const denominator = maxMonthlySales + 200;

        const chartData = monthlySalesArray.map((totalSales, i) => ({
            month: new Date(currentYear, i).toLocaleString('default', { month: 'long' }),
            totalSales,
            percent: parseFloat(((totalSales / denominator) * 100).toFixed(2)),
        }));

        return {
            message: 'Vendor sales chart data retrieved successfully',
            chartData,
        };
    }



    async getRecentOrder(vendorId: number): Promise<{
        message: string;
        recentOrders: any;
    }> {
        try {
            // 1. Validate vendor existence
            const vendorExists = await this.prisma.vendor.findUnique({
                where: { user_id: vendorId },
                select: { id: true },
            });

            if (!vendorExists) {
                throw new NotFoundException('Vendor not found');
            }

            vendorId = vendorExists.id;

            // 2. Get top 5 products by order quantity
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
                    recentOrders: [],
                };
            }

            // 3. Get product info + primary image
            const productIds = topProducts.map((p) => p.product_id);

            const products = await this.prisma.product.findMany({
                where: {
                    id: { in: productIds },
                },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    product_images: {
                        // where: { is_primary: true },
                        take: 1,
                        select: {
                            image_url: true,
                        },
                    },
                },
            });

            // 4. Merge product + order data
            const recentOrders = topProducts.map((tp) => {
                const product = products.find((p) => p.id === tp.product_id);
                const totalOrder = tp._sum.quantity || 0;
                const totalAmount = product ? product.price * totalOrder : 0;

                return {
                    product_id: tp.product_id,
                    product_name: product?.name || 'Unknown',
                    product_price: product?.price || 0,
                    product_image: product?.product_images?.[0]?.image_url || null,
                    totalOrder,
                    totalAmount,
                };
            });

            return {
                message: 'Top 5 recent vendor product orders fetched successfully',
                recentOrders,
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
        newProducts: Array<VendorProduct & { product: Product & { primaryImage?: string } }>;
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

            // Get the 2 most recent vendor products with product details and primary image
            const newProducts = await this.prisma.vendorProduct.findMany({
                where: {
                    vendor_id: vendor.id,
                },
                orderBy: {
                    created_at: 'desc',
                },
                take: 2,
                include: {
                    product: {
                        include: {
                            product_images: {
                                // where: {
                                //     is_primary: true,
                                // },
                                select: {
                                    image_url: true,
                                },
                                take: 1,
                            },
                        },
                    },
                },
            });

            // Transform the data to include primary image URL
            const productsWithImages = newProducts.map(vendorProduct => ({
                ...vendorProduct,
                product: {
                    ...vendorProduct.product,
                    // primaryImage: vendorProduct.product.product_images[0]?.image_url || null,
                },
            }));

            return {
                message: 'Newest vendor products fetched successfully',
                newProducts: productsWithImages,
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
