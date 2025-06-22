import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient, Product } from '@prisma/client';
import { UpdateVendorPasswordDto, UpdateVendorDto } from './dto';
import { FileService } from 'src/app/services/file.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SettingService {
    private prisma: PrismaClient;

    constructor(private readonly fileService: FileService) {
        this.prisma = new PrismaClient();
    }
    async getInfo(userId: number): Promise<any> {
        // Find the vendor associated with the user ID
        const vendor = await this.prisma.vendor.findUnique({
            where: { user_id: userId },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true,
                        email: true,
                        avatar: true,
                    },
                },
            },
        });

        if (!vendor) {
            throw new NotFoundException('Vendor not found');
        }

        // Map to DTO
        return {
            id: vendor.id,
            uuid: vendor.uuid,
            business_name: vendor.business_name,
            business_email: vendor.business_email,
            business_phone: vendor.business_phone,
            status: vendor.status,
            created_at: vendor.created_at,
            updated_at: vendor.updated_at,
            user: {
                first_name: vendor.user.first_name,
                last_name: vendor.user.last_name,
                email: vendor.user.email,
                avatar: vendor.user.avatar,
            }
        };
    }

    async update(
        userId: number,
        updateVendorDto: UpdateVendorDto
    ): Promise<{ data: any; message: string }> {
        // First check if the vendor exists
        const existingVendor = await this.prisma.vendor.findUnique({
            where: { user_id: userId },
            include: { user: true },
        });

        if (!existingVendor) {
            throw new NotFoundException('Vendor not found');
        }

        // Check for email uniqueness (both user email and business email)
        if (updateVendorDto.email !== existingVendor.user.email) {
            const emailExists = await this.prisma.user.findUnique({
                where: { email: updateVendorDto.email },
            });
            if (emailExists) {
                throw new ConflictException('Email already in use');
            }
        }

        if (updateVendorDto.business_email !== existingVendor.business_email) {
            const businessEmailExists = await this.prisma.vendor.findFirst({
                where: {
                    business_email: updateVendorDto.business_email,
                    NOT: { id: existingVendor.id },
                },
            });
            if (businessEmailExists) {
                throw new ConflictException('Business email already in use');
            }
        }

        // Perform the update in a transaction to ensure data consistency
        const [updatedVendor, updatedUser] = await this.prisma.$transaction([
            this.prisma.vendor.update({
                where: { user_id: userId },
                data: {
                    business_name: updateVendorDto.business_name,
                    business_phone: updateVendorDto.business_phone,
                    business_email: updateVendorDto.business_email,
                    updated_at: new Date(),
                },
            }),
            this.prisma.user.update({
                where: { id: userId },
                data: {
                    first_name: updateVendorDto.first_name,
                    last_name: updateVendorDto.last_name,
                    email: updateVendorDto.email,
                    updated_at: new Date(),
                },
            }),
        ]);

        return {
            data: {
                id: updatedVendor.id,
                uuid: updatedVendor.uuid,
                business_name: updatedVendor.business_name,
                business_email: updatedVendor.business_email,
                business_phone: updatedVendor.business_phone,
                status: updatedVendor.status,
                user: {
                    first_name: updatedUser.first_name,
                    last_name: updatedUser.last_name,
                    email: updatedUser.email,
                    avatar: updatedUser.avatar,
                },
            },
            message: 'Vendor information updated successfully',
        };
    }

    async updatePassword(
        userId: number,
        dto: UpdateVendorPasswordDto
    ): Promise<{ message: string }> {
        // 1. Find the user
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // 2. Verify old password
        if (!user.password) {
            throw new BadRequestException('No password set for this account');
        }

        const isMatch = await bcrypt.compare(dto.old_password, user.password);
        if (!isMatch) {
            throw new BadRequestException('Old password is incorrect');
        }

        // 3. Validate new password
        if (dto.new_password !== dto.confirm_password) {
            throw new BadRequestException('New password and confirm password do not match');
        }

        // 4. Check if new password is different from old
        const isSamePassword = await bcrypt.compare(dto.new_password, user.password);
        if (isSamePassword) {
            throw new BadRequestException('New password must be different from old password');
        }

        // 5. Hash the new password
        const hashedPassword = await bcrypt.hash(dto.new_password, 12);

        // 6. Update password and create history in a transaction
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: userId },
                data: {
                    password: hashedPassword,
                    updated_at: new Date(),
                },
            }),
            this.prisma.passwordChange.create({
                data: {
                    user_id: userId,
                    old_password: user.password, // Store the hashed old password from user record
                    new_password: hashedPassword,
                    confirm_password: hashedPassword, // Store hashed for consistency
                },
            }),
        ]);

        return {
            message: 'Password updated successfully',
        };
    }
}