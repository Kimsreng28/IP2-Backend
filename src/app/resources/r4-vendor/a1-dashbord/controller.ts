// ===========================================================================>> Custom Library
import { Controller, Get, UseGuards } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { RolesDecorator } from 'src/app/core/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/app/core/guards/jwt-auth.guard';
import { DashboardService } from './service';

import { RoleEnum, VendorProduct } from '@prisma/client';
import UserDecorator from 'src/app/core/decorators/user.decorator';

@Controller()
export class DashboardController {
  constructor(private readonly _service: DashboardService) {}

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.VENDOR)
  @Get('/total')
  async getTotal(@UserDecorator() auth: any): Promise<{
    message: string;
    totalVendor: number;
    totalProduct: number;
    totalSales: number;
  }> {
    // console.log("auth", auth);
    return this._service.getTotal(auth.userId);
  }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.VENDOR)
  @Get('/newProducts')
  async getNewProducts(
    @UserDecorator() auth: any,
  ): Promise<{ message: string; newProducts: VendorProduct[] }> {
    // console.log("auth", auth);
    return this._service.getNewProducts(auth.userId);
  }

  // @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  // @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  // @Query('sortByPrice', new DefaultValuePipe('asc')) sortByPrice: 'asc' | 'desc',
  // @Query('keySearch') keySearch?: string,
  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.VENDOR)
  @Get('/recentOrders')
  async getRecentOrder(@UserDecorator() auth: any): Promise<{
    message: string;
    recentOrder: any;
  }> {
    return this._service.getRecentOrder(auth.userId);
  }
}

// vendorProducts: VendorProduct[];
// totalItems: number;
// page: number;
// totalPages: number;
