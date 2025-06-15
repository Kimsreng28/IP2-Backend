// import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
// import { Event } from '@prisma/client';
import { RoleEnum } from 'src/app/enums/role.enum';
// import { CreateEventDto, UpdateEventDto } from './dto';
// import { FilesInterceptor } from '@nestjs/platform-express';
import { RolesDecorator } from 'src/app/core/decorators/roles.decorator';
import UserDecorator from 'src/app/core/decorators/user.decorator';
import { JwtAuthGuard } from 'src/app/core/guards/jwt-auth.guard';
import { VendorEvent } from '@prisma/client';
import { VendorEventService } from './service';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { CreateEventDto, UpdateEventDto } from './dto';
// import UserDecorator from 'src/app/core/decorators/user.decorator';

@Controller()
export class VendorEventController {

    constructor(private _service: VendorEventService) { };

    // @UseGuards(JwtAuthGuard)
    // @RolesDecorator(RoleEnum.VENDOR)
    // @Get("/setUp")
    // async setUpData(
    //     @UserDecorator() auth: any
    // ): Promise<{ message: string; brands: any[]; categories: any[] }> {
    //     return this._service.setUpData(auth.userId);
    // }

    // @Get("/setUp")

    // @RolesDecorator(RoleEnum.VENDOR)
    // async setUpData(
    //     @UserDecorator() requestingUser: any,
    // ): Promise<{ message: string; brands: any[]; categories: any[] }> {
    //     return this._service.setUpData(requestingUser);
    // }

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Get()
    async getAllEvents(
        @UserDecorator() auth: any,
    ): Promise<{
        events: VendorEvent[];
        totalItems: number;
    }> {
        return this._service.getAllEvents(auth.userId);
    }

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Get('/:id')
    async view(@UserDecorator() auth: any, @Param('id', ParseIntPipe) id: number) {
        return await this._service.getEvent(auth.userId, id);
    }

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Post()
    async create(
        @UserDecorator() auth: any,
        @Body() body: CreateEventDto): Promise<{ data: VendorEvent, message: string }> {
        return await this._service.create(auth.userId, body);
    }

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Put(':id')
    async update(
        @UserDecorator() auth: any,
        @Param('id', ParseIntPipe) id: number, @Body() body: UpdateEventDto): Promise<{ data: VendorEvent, message: string }> {
        return this._service.update(auth.userId, id, body);
    }

    @UseGuards(JwtAuthGuard)
    @RolesDecorator(RoleEnum.VENDOR)
    @Delete(':id')
    async delete(@UserDecorator() auth: any, @Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
        return await this._service.delete(auth.userId, id);
    }
}