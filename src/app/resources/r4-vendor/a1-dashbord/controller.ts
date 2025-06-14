// ===========================================================================>> Custom Library
import { Controller, DefaultValuePipe, Get, Query, UseGuards } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { DashboardService } from './service';
import { JwtAuthGuard } from 'src/app/core/guards/jwt-auth.guard';
import { RolesDecorator } from 'src/app/core/decorators/roles.decorator';

import UserDecorator from 'src/app/core/decorators/user.decorator';
import { RoleEnum } from 'src/app/enums/role.enum';

@Controller()
export class DashboardController {
  constructor(private readonly _service: DashboardService) { }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.VENDOR)
  @Get("/total")
  async getTotal(
    @UserDecorator() auth: any
  ): Promise<{ message: string; totalVendor: number; totalProduct: number, totalSales: number }> {
    // console.log("auth", auth);
    return this._service.getTotal(auth.userId);
  }

  // @UseGuards(JwtAuthGuard)
  // @RolesDecorator(RoleEnum.VENDOR)
  // @Get()
  // async getRecentOrder(
  //   @UserDecorator() auth: any,
  //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  //   @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  //   @Query('sortByPrice', new DefaultValuePipe('asc')) sortByPrice: 'asc' | 'desc',
  //   @Query('keySearch') keySearch?: string,
  // ): Promise<{
  //   products: Product[];
  //   totalItems: number;
  //   page: number;
  //   totalPages: number;
  // }> {
  //   return this._service.getRecentOrder(auth.userId, page, limit, sortByPrice, keySearch);
  // }
}
