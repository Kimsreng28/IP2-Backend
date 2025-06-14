// ===========================================================================>> Core Library
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FileService } from 'src/app/services/file.service';

@Injectable()
export class DashboardService {
    private prisma: PrismaClient;

    constructor(private readonly fileService: FileService) {
        this.prisma = new PrismaClient();
    }

    async getTotal(authId: number): Promise<{
        message: string;
        totalVendor: number;
        totalProduct: number;
        totalSales: number
    }> {
        // Get the vendor associated with the authenticated user
        const vendor = await this.prisma.vendor.findUnique({
            where: { user_id: authId },
            select: { id: true }
        });

        if (!vendor) {
            throw new Error('Vendor not found');
        }

        // Count all vendors (for admin purposes, though this seems odd for a vendor-specific endpoint)
        const totalVendor = await this.prisma.vendor.count();

        // Count products for this specific vendor
        const totalProduct = await this.prisma.vendorProduct.count({
            where: { vendor_id: vendor.id }
        });

        // Calculate total sales (sum of paid orders for this vendor)
        const result = await this.prisma.order.aggregate({
            _sum: {
                total_amount: true
            },
            where: {
                vendor_id: vendor.id,
                payment_status: 'paid'
            }
        });

        const totalSales = result._sum.total_amount || 0;

        return {
            message: 'Total counts retrieved successfully',
            totalVendor,
            totalProduct,
            totalSales
        };
    }

        // async getRecentOrder(
        //     authId: number,
        //     page: number,
        //     limit: number,
        //     sortByPrice: 'asc' | 'desc',
        //     keySearch?: string,
        // ): Promise<{
        //     products: Product[];
        //     totalItems: number;
        //     page: number;
        //     totalPages: number;
        // }> {
        //     try {
        //         const offset = (page - 1) * limit;
    
        //         // First, find the vendor associated with the authId (user_id)
        //         const vendor = await this.prisma.vendor.findUnique({
        //             where: { user_id: authId },
        //             select: { id: true }
        //         });
    
        //         if (!vendor) {
        //             throw new Error('Vendor not found');
        //         }
    
        //         // Build the where condition for vendor products
        //         const whereCondition: any = {
        //             vendor_id: vendor.id,
        //         };
    
        //         // Add search condition if keySearch is provided
        //         if (keySearch) {
        //             whereCondition.product = {
        //                 OR: [
        //                     { name: { contains: keySearch } },
        //                     { description: { contains: keySearch } }
        //                 ]
        //             };
        //         }
    
        //         const [vendorProducts, totalItems] = await Promise.all([
        //             this.prisma.vendorProduct.findMany({
        //                 skip: offset,
        //                 take: limit,
        //                 where: whereCondition,
        //                 include: {
        //                     product: {
        //                         include: {
        //                             brand: true,
        //                             category: true,
        //                             product_images: true
        //                         }
        //                     }
        //                 },
        //                 orderBy: {
        //                     product: {
        //                         price: sortByPrice
        //                     }
        //                 }
        //             }),
        //             this.prisma.vendorProduct.count({ where: whereCondition }),
        //         ]);
    
        //         // Extract products from vendorProducts
        //         const products = vendorProducts.map(vp => vp.product);
    
        //         return {
        //             products,
        //             totalItems,
        //             page,
        //             totalPages: Math.ceil(totalItems / limit),
        //         };
        //     } catch (error) {
        //         throw new Error(`Failed to fetch products: ${error.message}`);
        //     }
        // }
}
