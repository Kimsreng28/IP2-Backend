// ===========================================================================>> Custom Library
import { Controller, Get } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { HomeService } from './service';

@Controller()
export class HomeController {
  constructor(private readonly _service: HomeService) {}

  @Get('banner')
  getHello(): string {
    return 'Hello Home!';
  }
}
