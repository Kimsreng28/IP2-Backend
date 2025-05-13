import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { PermissionAdminService } from "./service";
import { CreateUserDto, UpdateUserDto } from "./dto";

@Controller()
export class PermissionAdminController{
  constructor(
    private readonly _service: PermissionAdminService
) {}
    @Get(':id')
    async getUsers(
        @Param('id') role_id: number,
        @Query('key') key?: string,
        @Query('sortBy') sortBy: 'created_at' | 'updated_at' | 'first_name' | 'last_name' = 'updated_at',
        @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ){
        return await this._service.getUsers(role_id, key, sortBy, sortOrder, page, limit)
    } 

    @Get(':id')
    getOne(@Param('id') id: number) {
        return this._service.getUserById(+id);
    }

    @Post()
    create(@Body() dto: CreateUserDto) {
        return this._service.createUser(dto);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
        return this._service.updateUser(+id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: number) {
        return this._service.deleteUser(+id);
    }
}