// ===========================================================================>> Custom Library
import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';

// ===========================================================================>> Custom Library
import { RolesDecorator } from 'src/app/core/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/app/core/guards/jwt-auth.guard';
import { OrderHistoryService } from './service';

import { Order, RoleEnum } from '@prisma/client';
import UserDecorator from 'src/app/core/decorators/user.decorator';

@Controller()
export class OrderHistoryController {
  constructor(private readonly _service: OrderHistoryService) { }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.VENDOR)
  @Get()
  async getOrdersHistories(
    @UserDecorator() auth: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sort', new DefaultValuePipe('asc'))
    sort: 'asc' | 'desc',
    @Query('keySearch') keySearch?: string,
  ): Promise<{
    ordersHistories: Order[];
    totalItems: number;
    page: number;
    totalPages: number;
  }> {
    return this._service.getOrdersHistories(
      auth.userId,
      page,
      limit,
      sort,
      keySearch,
    );
  }

  @UseGuards(JwtAuthGuard)
  @RolesDecorator(RoleEnum.VENDOR)
  @Get(':orderId')
  async getOrderHistory(
    @UserDecorator() auth: any,
    @Param('orderId') orderId: number,
  ): Promise<{
    orderHistory: Order;
  }> {
    return this._service.getOrderHistory(auth.userId, orderId);
  }


}
