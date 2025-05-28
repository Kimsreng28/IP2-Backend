/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClient, Product } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto';
import { FileService } from 'src/app/services/file.service';

@Injectable()
export class ProductService {
    private prisma: PrismaClient;

    constructor(private readonly fileService: FileService) {
        this.prisma = new PrismaClient();
    }

    async getAllProducts(
        page: number,
        limit: number,
        sortByPrice: 'asc' | 'desc',
        keySearch?: string,
    ): Promise<{
        products: Product[];
        totalItems: number;
        page: number;
        totalPages: number;
    }> {
        try {
            const offset = (page - 1) * limit;

            const whereCondition = keySearch ? {
                OR: [
                    { name: { contains: keySearch } },
                    { description: { contains: keySearch } },
                    {
                        brand: {
                            is: {
                                name: { contains: keySearch }
                            }
                        }
                    },
                    {
                        category: {
                            is: {
                                name: { contains: keySearch }
                            }
                        }
                    }
                ]
            } : {};

            const [products, totalItems] = await Promise.all([
                this.prisma.product.findMany({
                    skip: offset,
                    take: limit,
                    orderBy: {
                        price: sortByPrice
                    },
                    where: whereCondition,
                    include: { brand: true, category: true, product_images: true },
                }),
                this.prisma.product.count({ where: whereCondition }),
            ]);

            return {
                products,
                totalItems,
                page,
                totalPages: Math.ceil(totalItems / limit),
            };
        } catch (error) {
            throw new Error(`Failed to fetch products: ${error.message}`);
        }
    }


    async getProduct(id: string): Promise<Product | null> {
        try {
            const product = await this.prisma.product.findUnique({
                where: { id: Number(id) },
                include: { brand: true, category: true, product_images: true },
            });
            return product;
        } catch (error) {
            throw new Error(
                `Failed to fetch product with ID ${id}: ${error.message}`,
            );
        }
    }

    async create(
        body: CreateProductDto,
        files: Express.Multer.File[],
    ): Promise<{ data: Product; message: string }> {
        const existingName = await this.prisma.product.findFirst({
            where: { name: body.name },
        });
        if (existingName) { throw new BadRequestException('This name already exists in the system.') }

        const categoryExists = await this.prisma.category.findUnique({
            where: { id: Number(body.category_id) },
        });
        if (!categoryExists) throw new BadRequestException('Invalid category_id');

        const brandExists = await this.prisma.brand.findUnique({
            where: { id: Number(body.brand_id) },
        });
        if (!brandExists) throw new BadRequestException('Invalid brand_id');

        const uploadImages = await this.fileService.uploadMultipleProductImages(files);

        const successfulUploads = uploadImages.filter(img => !img.error);
        if (successfulUploads.length === 0) throw new BadRequestException('All image uploads failed');

        const createdProduct = await this.prisma.product.create({
            data: {
                name: body.name,
                description: body.description,
                price: body.price,
                stock: body.stock,
                brand_id: Number(body.brand_id),
                category_id: Number(body.category_id),
                is_new_arrival: body.is_new_arrival ?? false,
                is_best_seller: body.is_best_seller ?? false,
            },
        });

        // Create ProductImage records for each uploaded image
        // Set first image as primary (is_primary: true)
        // const productImages = await Promise.all(
        //     uploadImages.map((image, index) => {
        //         if (image.error) {

        //             return null;
        //         }
        //         return this.prisma.productImage.create({
        //             data: {
        //                 product_id: createdProduct.id,
        //                 image_url: image.file.uri, 
        //                 is_primary: index === 0 
        //             }
        //         });
        //     })
        // ).then(images => images.filter(Boolean)); 

        await this.prisma.productImage.createMany({
            data: successfulUploads.map((image, index) => ({
                product_id: createdProduct.id,
                image_url: image.file.uri,
                is_primary: index === 0,
            })),
        });

        const data = await this.prisma.product.findUnique({
            where: { id: createdProduct.id },
            include: {
                brand: true,
                category: true,
                product_images: {
                    where: { product_id: createdProduct.id },
                },
            },
        });

        return { data, message: 'Product created successfully' };
    }

    async update(
        body: UpdateProductDto,
        id: string,
    ): Promise<{ data: Product; message: string }> {
        const existingProduct = await this.prisma.product.findUnique({
            where: { id: Number(id) },
        });
        if (!existingProduct) {
            throw new BadRequestException('No data found for the provided ID.');
        }

        const brand = await this.prisma.brand.findUnique({
            where: { id: Number(body.brand_id) },
        });
        if (!brand) throw new BadRequestException('Invalid brand_id');

        const category = await this.prisma.category.findUnique({
            where: { id: Number(body.category_id) },
        });
        if (!category) throw new BadRequestException('Invalid category_id');

        const updatedProduct = await this.prisma.product.update({
            where: { id: Number(id) },
            data: {
                name: body.name,
                description: body.description,
                price: body.price,
                stock: body.stock,
                brand_id: Number(body.brand_id),
                category_id: Number(body.category_id),
                is_new_arrival: body.is_new_arrival ?? existingProduct.is_new_arrival,
                is_best_seller: body.is_best_seller ?? existingProduct.is_best_seller,
            },
        });

        const data = await this.prisma.product.findUnique({
            where: { id: updatedProduct.id },
            include: {
                brand: true,
                category: true,
            },
        });

        return { data, message: 'Product updated successfully' };
    }

    async delete(id: string): Promise<{ message: string }> {
        try {
            await this.prisma.product.delete({
                where: { id: Number(id) },
            });
            return { message: 'Product deleted successfully' };
        } catch (error) {
            throw new Error(
                `Failed to delete product with ID ${id}: ${error.message}`,
            );
        }
    }
}