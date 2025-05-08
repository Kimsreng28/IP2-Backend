// ===========================================================================>> Custom Library
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

// ===========================================================================>> Custom Library
import { JwtAuthGuard } from 'src/app/core/guards/jwt-auth.guard';
import { CreateAddressDto } from './dto/create_address.dto';
import { UpdateAddressDto } from './dto/update_address.dto';
import { ProfileService } from './service';

@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get('addresses')
  async findAll(@Req() req) {
    try {
      return await this.profileService.getUserAddresses(req.user.userId);
    } catch (error) {
      return {
        status_code: 500,
        message: 'Failed to fetch addresses',
        error: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('addresses/create')
  async create(@Req() req, @Body() createAddressDto: CreateAddressDto) {
    try {
      return await this.profileService.createAddress(
        req.user.userId,
        createAddressDto,
      );
    } catch (error) {
      return {
        status_code: 500,
        message: 'Failed to create address',
        error: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('addresses/:id')
  async updateAddress(
    @Req() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateAddressDto,
  ) {
    try {
      return await this.profileService.updateAddress(
        req.user.userId,
        Number(id),
        updateDto,
      );
    } catch (error) {
      return {
        status_code: 500,
        message: 'Failed to update address',
        error: error.message,
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('addresses/:id')
  async deleteAddress(@Req() req, @Param('id') id: string) {
    try {
      return await this.profileService.deleteAddress(
        req.user.userId,
        Number(id),
      );
    } catch (error) {
      return {
        status_code: 500,
        message: 'Failed to delete address',
        error: error.message,
      };
    }
  }
}
