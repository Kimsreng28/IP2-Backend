/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaClient, Product } from "@prisma/client";
import { CreateProductDto, UpdateProductDto } from "./dto";

@Injectable()
export class ProductService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
    async getAllProducts(): Promise<Product[]> {
        try {
            const products = await this.prisma.product.findMany({
                // include: {
                //     brand: true,
                //     category: true,

                // },
            });
            return products;
        } catch (error) {
            throw new Error(`Failed to fetch products: ${error.message}`);
        }
    }

    async getProduct(id: string): Promise<Product | null> {
        try {
            const product = await this.prisma.product.findUnique({
                where: { id },
                // include: {
                //     brand: true,
                //     category: true,
                // },
            });
            return product;
        } catch (error) {
            throw new Error(`Failed to fetch product with ID ${id}: ${error.message}`);
        }
    }

    async create(body: CreateProductDto): Promise<{ data: Product, message: string }> {

        const existingName = await this.prisma.product.findFirst({
            where: { name: body.name },
        });
        if (existingName) {
            throw new BadRequestException('This name already exists in the system.');
        }

        const categoryExists = await this.prisma.category.findUnique({
            where: { id: body.category_id },
        });
        if (!categoryExists) throw new BadRequestException('Invalid category_id');

        const brandExists = await this.prisma.brand.findUnique({
            where: { id: body.brand_id },
        });
        if (!brandExists) throw new BadRequestException('Invalid brand_id');


        const createdProduct = await this.prisma.product.create({
            data: {
                name: body.name,
                description: body.description,
                price: body.price,
                stock: body.stock,
                brand_id: body.brand_id,
                category_id: body.category_id,
                is_new_arrival: body.is_new_arrival ?? false,
                is_best_seller: body.is_best_seller ?? false,
            },
        });

        const data = await this.prisma.product.findUnique({
            where: { id: createdProduct.id },
            include: {
                brand: true,
                category: true,
            }
        });

        return { data, message: "Product created successfully" };
    }

    async update(body: UpdateProductDto, id: string): Promise<{ data: Product, message: string }> {
        const existingProduct = await this.prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            throw new BadRequestException('No data found for the provided ID.');
        }

        const brand = await this.prisma.brand.findUnique({ where: { id: body.brand_id } });
        if (!brand) throw new BadRequestException('Invalid brand_id');

        const category = await this.prisma.category.findUnique({ where: { id: body.category_id } });
        if (!category) throw new BadRequestException('Invalid category_id');


        const updatedProduct = await this.prisma.product.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                price: body.price,
                stock: body.stock,
                brand_id: body.brand_id,
                category_id: body.category_id,
                is_new_arrival: body.is_new_arrival ?? existingProduct.is_new_arrival,
                is_best_seller: body.is_best_seller ?? existingProduct.is_best_seller,
            }
        });

        const data = await this.prisma.product.findUnique({
            where: { id: updatedProduct.id },
            include: {
                brand: true,
                category: true,
            }
        });

        return { data, message: "Product updated successfully" };
    }

    async delete(id: string): Promise<{ message: string }> {
        try {
            await this.prisma.product.delete({
                where: { id },
            });
            return { message: "Product deleted successfully" };
        } catch (error) {
            throw new Error(`Failed to delete product with ID ${id}: ${error.message}`);
        }
    }

}