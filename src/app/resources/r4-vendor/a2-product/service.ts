/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient, Product } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto';
import { FileService } from 'src/app/services/file.service';

@Injectable()
export class ProductService {
    private prisma: PrismaClient;

    constructor(private readonly fileService: FileService) {
        this.prisma = new PrismaClient();
    }

    // async setUpData(): Promise<{ message: string; brands: any[]; categories: any[] }> {
    async setUpData(authId: number): Promise<{ message: string; brands: any[]; categories: any[] }> {
        console.log('authId', authId);
        const brands = await this.prisma.brand.findMany();
        const categories = await this.prisma.category.findMany();

        return {
            message: 'Brands and Categories fetched successfully',
            brands,
            categories,
        };
    }

    async getAllProducts(
        authId: number,
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

            // First, find the vendor associated with the authId (user_id)
            const vendor = await this.prisma.vendor.findUnique({
                where: { user_id: authId },
                select: { id: true }
            });

            if (!vendor) {
                throw new Error('Vendor not found');
            }

            // Build the where condition for vendor products
            const whereCondition: any = {
                vendor_id: vendor.id,
            };

            // Add search condition if keySearch is provided
            if (keySearch) {
                whereCondition.product = {
                    OR: [
                        { name: { contains: keySearch } },
                        { description: { contains: keySearch } }
                    ]
                };
            }

            const [vendorProducts, totalItems] = await Promise.all([
                this.prisma.vendorProduct.findMany({
                    skip: offset,
                    take: limit,
                    where: whereCondition,
                    include: {
                        product: {
                            include: {
                                brand: true,
                                category: true,
                                product_images: true
                            }
                        }
                    },
                    orderBy: {
                        product: {
                            price: sortByPrice
                        }
                    }
                }),
                this.prisma.vendorProduct.count({ where: whereCondition }),
            ]);

            // Extract products from vendorProducts
            const products = vendorProducts.map(vp => vp.product);

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


    async getProduct(authId: number, id: number): Promise<Product> {
        // First, find the vendor associated with the authId (user_id)
        const vendor = await this.prisma.vendor.findUnique({
            where: { user_id: authId },
            select: { id: true }
        });

        if (!vendor) {
            throw new NotFoundException('Vendor not found');
        }

        // Check if the product exists and belongs to this vendor
        const vendorProduct = await this.prisma.vendorProduct.findFirst({
            where: {
                vendor_id: vendor.id,
                product_id: id
            },
            include: {
                product: {
                    include: {
                        brand: true,
                        category: true,
                        product_images: true
                    }
                }
            }
        });

        if (!vendorProduct) {
            throw new NotFoundException(`Product with ID ${id} not found or not associated with your vendor account`);
        }

        return vendorProduct.product;
    }

    async create(
        authId: number,
        body: CreateProductDto,
        files: Express.Multer.File[],
    ): Promise<{ data: Product; message: string }> {
        // First, find the vendor associated with the authId
        const vendor = await this.prisma.vendor.findUnique({
            where: { user_id: authId },
            select: { id: true }
        });

        if (!vendor) {
            throw new NotFoundException('Vendor not found');
        }

        // Check if product name exists (scoped to this vendor's products)
        const existingName = await this.prisma.vendorProduct.findFirst({
            where: {
                vendor_id: vendor.id,
                product: {
                    name: body.name
                }
            }
        });
        if (existingName) {
            throw new BadRequestException('This name already exists in your product catalog')
        }

        // Validate category and brand
        const categoryExists = await this.prisma.category.findUnique({
            where: { id: Number(body.category_id) },
        });
        if (!categoryExists) throw new BadRequestException('Invalid category_id');

        const brandExists = await this.prisma.brand.findUnique({
            where: { id: Number(body.brand_id) },
        });
        if (!brandExists) throw new BadRequestException('Invalid brand_id');

        // Upload product images
        const uploadImages = await this.fileService.uploadMultipleProductImages(files);
        const successfulUploads = uploadImages.filter(img => !img.error);
        if (successfulUploads.length === 0) throw new BadRequestException('All image uploads failed');

        // Create the product and associate it with the vendor
        const createdProduct = await this.prisma.$transaction(async (prisma) => {
            // Create the product
            const product = await prisma.product.create({
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

            // Associate the product with the vendor
            await prisma.vendorProduct.create({
                data: {
                    vendor_id: vendor.id,
                    product_id: product.id
                }
            });

            // Add product images
            await prisma.productImage.createMany({
                data: successfulUploads.map((image, index) => ({
                    product_id: product.id,
                    image_url: image.file.uri,
                    is_primary: index === 0,
                })),
            });

            return product;
        });

        // Return the complete product data with relationships
        const data = await this.prisma.product.findUnique({
            where: { id: createdProduct.id },
            include: {
                brand: true,
                category: true,
                product_images: true,
                vendor_products: {
                    where: { vendor_id: vendor.id },
                    include: { vendor: true }
                }
            },
        });

        return {
            data,
            message: 'Product created successfully and associated with your vendor account'
        };
    }
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

async update(
    authId: number,
    id: number,
    body: UpdateProductDto,
    files?: Express.Multer.File[],
): Promise<{ data: Product; message: string }> {
    // 1. Find the vendor associated with the authId
    const vendor = await this.prisma.vendor.findUnique({
        where: { user_id: authId },
        select: { id: true }
    });

    if (!vendor) {
        throw new NotFoundException('Vendor not found');
    }

    // 2. Check if the product exists and belongs to this vendor
    const vendorProduct = await this.prisma.vendorProduct.findFirst({
        where: {
            vendor_id: vendor.id,
            product_id: id
        },
        include: {
            product: true
        }
    });

    if (!vendorProduct) {
        throw new NotFoundException(`Product with ID ${id} not found or not associated with your vendor account`);
    }

    const existingProduct = vendorProduct.product;

    // 3. Check for duplicate name (scoped to this vendor's products)
    if (body.name) {
        const duplicateName = await this.prisma.vendorProduct.findFirst({
            where: {
                vendor_id: vendor.id,
                product: {
                    name: body.name,
                    id: { not: id }
                }
            }
        });
        if (duplicateName) {
            throw new BadRequestException('This name already exists in your product catalog');
        }
    }

    // 4. Validate category_id (if provided)
    if (body.category_id) {
        const categoryExists = await this.prisma.category.findUnique({
            where: { id: Number(body.category_id) },
        });
        if (!categoryExists) {
            throw new BadRequestException('Invalid category_id');
        }
    }

    // 5. Validate brand_id (if provided)
    if (body.brand_id) {
        const brandExists = await this.prisma.brand.findUnique({
            where: { id: Number(body.brand_id) },
        });
        if (!brandExists) {
            throw new BadRequestException('Invalid brand_id');
        }
    }

    let uploadResults = [];
    let successfulUploads = [];

    // 6. Handle image uploads (if new files are provided)
    if (files && files.length > 0) {
        uploadResults = await this.fileService.uploadMultipleProductImages(files);
        successfulUploads = uploadResults.filter(img => !img.error);
        if (successfulUploads.length === 0) {
            throw new BadRequestException('All image uploads failed');
        }
    }

    // 7. Perform the update in a transaction
    const updatedProduct = await this.prisma.$transaction(async (prisma) => {
        // Delete existing images if new ones are provided
        if (successfulUploads.length > 0) {
            await prisma.productImage.deleteMany({
                where: { product_id: id },
            });
        }

        // Update the product details
        const product = await prisma.product.update({
            where: { id },
            data: {
                name: body.name ?? existingProduct.name,
                description: body.description ?? existingProduct.description,
                price: body.price ?? existingProduct.price,
                stock: body.stock ?? existingProduct.stock,
                brand_id: body.brand_id ? Number(body.brand_id) : existingProduct.brand_id,
                category_id: body.category_id ? Number(body.category_id) : existingProduct.category_id,
                is_new_arrival: body.is_new_arrival ?? existingProduct.is_new_arrival,
                is_best_seller: body.is_best_seller ?? existingProduct.is_best_seller,
            },
        });

        // Add new images (if any)
        if (successfulUploads.length > 0) {
            await prisma.productImage.createMany({
                data: successfulUploads.map((image, index) => ({
                    product_id: product.id,
                    image_url: image.file.uri,
                    is_primary: index === 0,
                })),
            });
        }

        return product;
    });

    // 8. Fetch the updated product with relations
    const data = await this.prisma.product.findUnique({
        where: { id: updatedProduct.id },
        include: {
            brand: true,
            category: true,
            product_images: true,
            vendor_products: {
                where: { vendor_id: vendor.id },
                include: { vendor: true }
            }
        },
    });

    return { 
        data, 
        message: 'Product updated successfully' 
    };
}

async delete(authId: number, id: number): Promise<{ message: string }> {
    // 1. Find the vendor
    const vendor = await this.prisma.vendor.findUnique({
        where: { user_id: authId },
        select: { id: true }
    });

    if (!vendor) {
        throw new NotFoundException('Vendor not found');
    }

    // 2. Verify the product exists and belongs to this vendor
    const vendorProduct = await this.prisma.vendorProduct.findFirst({
        where: {
            vendor_id: vendor.id,
            product_id: id
        },
        include: {
            product: true
        }
    });

    if (!vendorProduct) {
        throw new NotFoundException(`Product with ID ${id} not found in your catalog`);
    }

    // 3. Perform deletion in a transaction
    try {
        await this.prisma.$transaction(async (prisma) => {
            // Delete all related records
            await Promise.all([
                prisma.productImage.deleteMany({ where: { product_id: id } }),
                prisma.productCollection.deleteMany({ where: { product_id: id } }),
                prisma.productReview.deleteMany({ where: { product_id: id } }),
                prisma.productQuestion.deleteMany({ where: { product_id: id } }),
                prisma.discount.deleteMany({ where: { product_id: id } }),
                prisma.cart.deleteMany({ where: { product_id: id } }),
                prisma.orderItem.deleteMany({ where: { product_id: id } }),
                prisma.wishlist.deleteMany({ where: { product_id: id } }),
            ]);
            
            // Delete the vendor-product association
            await prisma.vendorProduct.deleteMany({ where: { product_id: id } });

            // Delete the product itself
            await prisma.product.delete({ where: { id } });
        });

        return { message: 'Product deleted successfully' };
    } catch (error) {
        // Handle specific Prisma errors
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') { // Record not found
                throw new NotFoundException(`Product with ID ${id} not found`);
            }
        }
        throw new InternalServerErrorException(`Failed to delete product: ${error.message}`);
    }
}
}