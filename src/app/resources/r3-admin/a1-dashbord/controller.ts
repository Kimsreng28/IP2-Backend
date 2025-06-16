// ===========================================================================>> Custom Library
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { DashboardService } from './service';

@Controller()
export class DashboardController {
  constructor(private readonly _service: DashboardService) {}

  @Get()
  async getAll() {
    return;
    return this. _service.getData();
  }
  @Get('user') // Keep user listing at /admin/permission/users
  async getUsers(
  ) {
      return await this._service.getUsers()
  }



}