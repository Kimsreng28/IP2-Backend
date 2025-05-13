import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { SettingAdminService } from "./service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto";

@Controller()
export class SettingAdminController{
  constructor(
    private readonly _service: SettingAdminService
) {}
  @Get()
  getAll(
    @Query('key') key?: string,
    @Query('sortBy') sortBy?: 'id' | 'name',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this._service.getCategories(
      key,
      sortBy,
      sortOrder,
      page ? +page : 1,
      limit ? +limit : 10
    );
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this._service.getCategoryById(+id);
  }

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this._service.createCategory(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this._service.updateCategory(+id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this._service.deleteCategory(+id);
  }
}
