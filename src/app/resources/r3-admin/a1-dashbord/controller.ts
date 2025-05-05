// ===========================================================================>> Custom Library
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { DashboardService } from './service';

@Controller()
export class DashboardController {
  constructor(private readonly _service: DashboardService) {}

  @Get()
  async getAll() {
    return this. _service.getProducts();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this. _service.getProduct(Number(id));
  }

  @Post()
  async create(@Body() data) {
    return this. _service.createProduct(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data) {
    return this. _service.updateProduct(Number(id), data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this. _service.deleteProduct(Number(id));
  }
}