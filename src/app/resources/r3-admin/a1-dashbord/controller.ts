// ===========================================================================>> Custom Library
import { Controller, Get } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { DashboardService } from './service';

@Controller()
export class DashboardController {
  constructor(private readonly _service: DashboardService) {}

  @Get()
  getHello(): string {
    return 'Hello Admin!';
  }
}
