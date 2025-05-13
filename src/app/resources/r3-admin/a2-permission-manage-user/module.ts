import { Module } from "@nestjs/common";
import { PermissionAdminController } from "./controller";
import { PermissionAdminService } from "./service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    controllers: [PermissionAdminController],
    providers:[PermissionAdminService, PrismaService],

})
export class PermissionAdminModule{}