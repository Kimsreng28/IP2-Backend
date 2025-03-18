// ===========================================================================>> Core Library
import { Body, Controller, HttpCode, HttpStatus, Post, Req, UsePipes } from '@nestjs/common';

// ===========================================================================>> Costom Library
import UserDecorator from 'src/app/core/decorators/user.decorator';
import { RoleExistsPipe } from 'src/app/core/pipes/role.pipe';
import { UserPayload } from 'src/app/shared/user.payload';
import { LoginRequestDto } from './dto';
import { AuthService } from './service';

@Controller()
export class AuthController {

    constructor(private readonly _service: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() data: LoginRequestDto, @Req() req: Request) {
        return await this._service.login(data, req);
    }

    @Post('switch')
    @UsePipes(RoleExistsPipe)
    async switch(@UserDecorator() auth: UserPayload, @Body() body: { role_id: number }) {
        return await this._service.switchDefaultRole(auth, Number(body.role_id));
    }

}
