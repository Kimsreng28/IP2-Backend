// ===========================================================================>> Core Library
import { HttpStatus, Injectable } from '@nestjs/common';

// ===========================================================================>> Third Party Library
import { PrismaService } from 'src/prisma/prisma.service';

// ===========================================================================>> Custom Library
@Injectable()
export class HomeService {

    constructor(private prisma: PrismaService) { }
    async getNewArrivalProducts() {
        try {
            const products = await this.prisma.product.findMany({
                where: {
                    is_new_arrival: true,
                },
                include: {
                    category: true,
                    brand: true,
                    product_images: true,
                    discounts: true,
                },
            });

            return {
                status: HttpStatus.OK,
                data: products
            };
        } catch (error) {
            throw new Error('Could not fetch new arrival products');
        }
    }

    async getProductBestSellers() {
        try {
            const limit = 8
            const products = await this.prisma.product.findMany({
                // where: {
                //     is_best_seller: true,
                // },
                include: {
                    category: true,
                    brand: true,
                    product_images: true,
                    discounts: true,
                },
                take: limit,
            });

            return {
                status: HttpStatus.OK,
                data: products
            };
        } catch (error) {
            throw new Error('Could not fetch best seller products');
        }
    }
}
