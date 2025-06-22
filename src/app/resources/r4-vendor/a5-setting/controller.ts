import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Product } from '@prisma/client';
import { RoleEnum } from '@prisma/client';
import { UpdateVendorPasswordDto, UpdateVendorDto } from './dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RolesDecorator } from 'src/app/core/decorators/roles.decorator';
import UserDecorator from 'src/app/core/decorators/user.decorator';
import { JwtAuthGuard } from 'src/app/core/guards/jwt-auth.guard';
import { SettingService } from './service';
// import UserDecorator from 'src/app/core/decorators/user.decorator';

@Controller()
export class SettingController {

    constructor(private _service: SettingService) { };

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Get()
    async view(@UserDecorator() auth: any) {
        return await this._service.getInfo(auth.userId,);
    }


    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Put("/info")
    async update(
        @UserDecorator() auth: any,
        @Body() body: UpdateVendorDto): Promise<{ data: any, message: string }> {
        return this._service.update(auth.userId, body);
    }

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Put("/password")
    async updatePassword(
        @UserDecorator() auth: any,
        @Body() body: UpdateVendorPasswordDto): Promise<{ message: string }> {
        return this._service.updatePassword(auth.userId, body);
    }

}