// ================================================================>> Core Library
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

// ================================================================>> Third Party Library
import * as jwt from 'jsonwebtoken';
import jwtConstants from 'src/app/shared/jwt/constants';
import TokenPayload from 'src/app/shared/user.payload';

// ================================================================>> Custom Library

const UserDecorator = createParamDecorator(
  async (_data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const token: string = request.headers?.authorization?.split('Bearer ')[1];
    const payload = jwt.verify(token, jwtConstants.secret) as TokenPayload;

    return payload;
  },
);
export default UserDecorator;
