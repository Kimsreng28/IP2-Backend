import { Module } from "@nestjs/common";
import { SettingAdminController } from "./controller";
import { SettingAdminService } from "./service";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    controllers: [SettingAdminController],
    providers:[SettingAdminService, PrismaService],

})
export class SettingAdminModule{}