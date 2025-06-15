import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './service';
import { Product } from '@prisma/client';
import { RoleEnum } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RolesDecorator } from 'src/app/core/decorators/roles.decorator';
import UserDecorator from 'src/app/core/decorators/user.decorator';
import { JwtAuthGuard } from 'src/app/core/guards/jwt-auth.guard';
// import UserDecorator from 'src/app/core/decorators/user.decorator';

@Controller()
export class ProductController {

    constructor(private _service: ProductService) { };

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Get("/setUp")
    async setUpData(
        @UserDecorator() auth: any
    ): Promise<{ message: string; brands: any[]; categories: any[] }> {
        // console.log("auth", auth);
        return this._service.setUpData(auth.userId);
    }

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Get()
    async getAllProducts(
        @UserDecorator() auth: any,
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
        return this._service.getAllProducts(auth.userId, page, limit, sortByPrice, keySearch);
    }

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Get('/:id')
    async view(@UserDecorator() auth: any, @Param('id', ParseIntPipe) id: number) {
        return await this._service.getProduct(auth.userId, id);
    }

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Post()
    @UseInterceptors(FilesInterceptor('product_images'))
    async create(
        @UserDecorator() auth: any,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: CreateProductDto): Promise<{ data: Product, message: string }> {
        return await this._service.create(auth.userId, body, files);
    }

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Put(':id')
    @UseInterceptors(FilesInterceptor('product_images'))
    async update(
        @UserDecorator() auth: any,
        @UploadedFiles() files: Express.Multer.File[],
        @Param('id', ParseIntPipe) id: number, @Body() body: UpdateProductDto): Promise<{ data: Product, message: string }> {
        return this._service.update(auth.userId, id, body, files);
    }

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Delete(':id')
    async delete(@UserDecorator() auth: any, @Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        return await this._service.delete(auth.userId, id);
    }
}