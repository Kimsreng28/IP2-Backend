import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ProductService } from './service';
import { Product } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto';
import { FilesInterceptor } from '@nestjs/platform-express';
// import UserDecorator from 'src/app/core/decorators/user.decorator';

@Controller()
export class ProductController {

    constructor(private _service: ProductService) { };

    @Get("/setUp")
    async setUpData(): Promise<{ message: string; brands: any[]; categories: any[] }> {
        return this._service.setUpData();
    }


    @Get()
    async getAllProducts(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
        @Query('sortByPrice', new DefaultValuePipe('asc')) sortByPrice: 'asc' | 'desc',
        @Query('keySearch') keySearch?: string,
    ): Promise<{
        products: Product[];
        totalItems: number;
        page: number;
        totalPages: number;
    }> {
        return this._service.getAllProducts(page, limit, sortByPrice, keySearch);
    }


    @Get('/:id')
    async view(@Param('id', ParseIntPipe) id: string) {
        return await this._service.getProduct(id);
    }

    @Post()
    @UseInterceptors(FilesInterceptor('product_images'))
    async create(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: CreateProductDto): Promise<{ data: Product, message: string }> {
        return await this._service.create(body, files);
    }
    // @Post()
    // async create(@Body() body: CreateProductDto, @UserDecorator() auth: User): Promise<{ data: Product, message: string }> {
    //     return await this._service.create(body, auth.id);
    // }
    // @Post()
    // async create() {
    //     return "hello world";
    // }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: UpdateProductDto): Promise<{ data: Product, message: string }> {
        return this._service.update(body, id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
        return await this._service.delete(id);
    }
}