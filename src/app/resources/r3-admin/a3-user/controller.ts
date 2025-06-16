import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UploadedFiles, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { UserAdminService } from "./service";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";

@Controller()
export class UserAdminController{
  constructor(
    private readonly _service: UserAdminService
) {}

    @Get() // Keep user listing at /admin/permission/users
    async getUsers(
        @Query('role_id') role_id?: number, // Make optional
        @Query('key') key?: string,
        @Query('sortBy') sortBy: 'created_at' | 'updated_at' | 'first_name' | 'last_name' = 'updated_at',
        @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return await this._service.getUsers(
            role_id ? Number(role_id) : undefined,
            key,
            sortBy,
            sortOrder,
            page,
            limit
        )
    }
    
    @Get(':id')
    getOne(@Param('id') id: number) {
        return this._service.getUserById(+id);
    }

    @Post()
    @UseInterceptors(FilesInterceptor('avatars')) // Match the field name your client uses
    async create(
        @Body() dto: any,
        @UploadedFiles() files?: Express.Multer.File[]
    ) {
        console.log('Received DTO:', dto);
        console.log('Received files:', files);
        return this._service.createUser(dto, files || []);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() dto: any) {
        return this._service.updateUser(+id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: number) {
        return this._service.deleteUser(+id);
    }
}