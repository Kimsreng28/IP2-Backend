// ===========================================================================>> Custom Library
import { Controller, Get } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { ProfileService } from './service';

@Controller()
export class ProfileController {
  constructor(private readonly _service: ProfileService) {}

  @Get()
  getHello(): string {
    return 'Hello Profile!';
  }
}
