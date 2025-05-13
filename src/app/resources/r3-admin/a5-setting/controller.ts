import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { SettingAdminService } from "./service";
import { CreateCategoryDto, CreatePaymentDto, UpdateCategoryDto, UpdatePaymentDto } from "./dto";

@Controller()
export class SettingAdminController{
  constructor(
    private readonly _service: SettingAdminService
) {}
    @Get('categor')
    getAllCategory(
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

    @Get('category/:id')
    getOneCategory(@Param('id') id: string) {
        return this._service.getCategoryById(+id);
    }

    @Post('category')
    createCategory(@Body() dto: CreateCategoryDto) {
        return this._service.createCategory(dto);
    }

    @Put('category/:id')
    updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
        return this._service.updateCategory(+id, dto);
    }

    @Delete('category/:id')
    deleteCategory(@Param('id') id: string) {
       return this._service.deleteCategory(+id);
    }


  @Get('payment')
  getAllPayment(
      @Query('userId') userId?: string,
      @Query('orderId') orderId?: string,
      @Query('status') status?: string,
      @Query('sortBy') sortBy?: 'created_at' | 'amount',
      @Query('sortOrder') sortOrder?: 'asc' | 'desc',
      @Query('page') page?: string,
      @Query('limit') limit?: string
  ) {
      return this._service.getPayments(
          userId ? +userId : undefined,
          orderId ? +orderId : undefined,
          status,
          sortBy,
          sortOrder,
          page ? +page : 1,
          limit ? +limit : 10
      );
  }

  @Get('payment/:id')
  getByIdPayment(@Param('id') id: string) {
      return this._service.getPaymentById(+id);
  }

  @Get('payment/uuid/:uuid')
  getByUuidPayment(@Param('uuid') uuid: string) {
     return this._service.getPaymentByUuid(uuid);
  }

  @Post('payment')
  createPayment(@Body() dto: CreatePaymentDto) {
     return this._service.createPayment(dto);
  }

  @Put('payment/:id')
  updatePayment(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
     return this._service.updatePayment(+id, dto);
  }

  @Delete('payment/:id')
  deletePayment(@Param('id') id: string) {
     return this._service.deletePayment(+id);
  }
}
