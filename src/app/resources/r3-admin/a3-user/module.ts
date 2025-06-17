import { Module } from "@nestjs/common";
import { UserAdminController } from "./controller";
import { UserAdminService } from "./service";
import { PrismaService } from "src/prisma/prisma.service";
import { FileService } from "src/app/services/file.service";
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule],
    controllers: [UserAdminController],
    providers:[UserAdminService, PrismaService, FileService],

})
export class UserAdminModule{}