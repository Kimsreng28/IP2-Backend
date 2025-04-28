// ===========================================================================>> Core Library
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';

// ===========================================================================>> Third Party Library
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
// ===========================================================================>> Costom Library
// Model
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductAdminService {

    constructor(private prisma: PrismaService) { }

    async getDataProduct(){
        return 'hello';
    }
}
