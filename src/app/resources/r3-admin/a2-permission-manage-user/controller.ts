import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { PermissionAdminService } from "./service";
import { CreateUserDto, UpdateUserDto } from "./dto";

@Controller()
export class PermissionAdminController{
  constructor(
    private readonly _service: PermissionAdminService
) {}
    @Get('roles') // Changed endpoint to /admin/permission/roles
    async getRolesWithUserCounts() {
        return await this._service.getRolesWithUserCounts();
    }

     
    @Get('roles/:id') // New endpoint for getting users by role ID
    async getUsersByRole(
        @Param('id') id: number,
        @Query('key') key?: string,
        @Query('sortBy') sortBy: 'created_at' | 'updated_at' | 'first_name' | 'last_name' = 'updated_at',
        @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return await this._service.getUsersByRole(
            Number(id),
            key,
            sortBy,
            sortOrder,
            page,
            limit
        );
    };
}