import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ProductService } from './service';
import { Product } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto';
// import UserDecorator from 'src/app/core/decorators/user.decorator';

@Controller()
export class ProductController {

    constructor(private _service: ProductService) { };

    @Get()
    async getAllProducts(): Promise<Product[]> {
        return this._service.getAllProducts();
    }

    @Get('/:id')
    async view(@Param('id', ParseIntPipe) id: string) {
        return await this._service.getProduct(id);
    }

    @Post()
    async create(@Body() body: CreateProductDto): Promise<{ data: Product, message: string }> {
        return await this._service.create(body);
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
