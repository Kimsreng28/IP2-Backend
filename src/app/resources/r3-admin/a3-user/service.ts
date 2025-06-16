import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { RoleEnum } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto";
import { FileService } from "src/app/services/file.service";
import { hash } from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserAdminService{
    constructor(private prisma: PrismaService, private readonly fileService: FileService) {}

    async getUsers(
        role_id?: number,
        key?: string,
        sortBy: 'created_at' | 'updated_at' | 'first_name' | 'last_name' = 'updated_at',
        sortOrder: 'asc' | 'desc' = 'desc',
        page: number = 1,
        limit: number = 10
        ) {
        // Validate and sanitize pagination parameters
        const pageNumber = isNaN(page) || page < 1 ? 1 : Math.floor(page);
        const limitNumber = isNaN(limit) || limit < 1 ? 10 : Math.floor(limit);
        
        const where: any = {};
        
        // Add role filter only if specified
        if (role_id) {
            switch(role_id) {
            case 1: where.role = RoleEnum.ADMIN; break;
            case 2: where.role = RoleEnum.CUSTOMER; break;
            case 3: where.role = RoleEnum.VENDOR; break;
            default: throw new BadRequestException('Invalid role ID');
            }
        }

        if (key) {
            where.OR = [
            { first_name: { contains: key, mode: 'insensitive' } },
            { last_name: { contains: key, mode: 'insensitive' } },
            { email: { contains: key, mode: 'insensitive' } }
            ];
        }

        try {
            const [users, totalCount] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    role: true,
                    status: true,
                    created_at: true,
                    updated_at: true,
                    avatar: true
                },
                orderBy: { [sortBy]: sortOrder },
                skip: (pageNumber - 1) * limitNumber,
                take: limitNumber
            }),
            this.prisma.user.count({ where })
            ]);

            const lastUpdated = await this.prisma.user.aggregate({
            where,
            _max: { updated_at: true }
            });

            return {
            data: users,
            pagination: {
                total: totalCount,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalCount / limitNumber)
            },
            lastUpdated: lastUpdated._max.updated_at
            };
        } catch (err) {
            throw new BadRequestException(`Could not fetch users: ${err.message}`);
        }
    }

    async getUserById(id: number) {
        try {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
            addresses: true,
            vendor: true,
            admin: true,
            customer: true
            }
        });

        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        return user;
        } catch (err) {
        this.handleError(err);
        }
    }

    // POST (Create)
    async createUser(
        dto: any,
        files: Express.Multer.File[] = []
        ) {
        try {
            // Validate input
            if (!dto.email || !dto.password) {
            throw new BadRequestException('Email and password are required');
            }

            let avatarUrl = dto.avatars;

            // Process file uploads if any
            if (files?.length > 0) {
            try {
                const uploadResults = await this.fileService.uploadMultipleProductImages(files);
                const successfulUploads = uploadResults.filter(result => !result.error);

                if (successfulUploads.length === 0) {
                throw new BadRequestException('All image uploads failed. Please check file formats and try again.');
                }

                // Use the first successful upload as avatar
                avatarUrl = successfulUploads[0].file?.uri;
                
                // Clean up other files if you don't need them
                // (or modify to handle multiple avatars if needed)
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
                throw new BadRequestException('Failed to process uploaded files');
            }
            }

            // Hash the password
            const hashedPassword = await hash(dto.password, 12);

            // Create user
            return await this.prisma.user.create({
            data: {
                first_name: dto.first_name,
                last_name: dto.last_name,
                email: dto.email,
                password: hashedPassword,
                role: dto.role,
                avatar: avatarUrl,
                email_verified: dto.email_verified ?? false,
                status: dto.status ?? 'ACTIVE'
            },
            select: { 
                id: true, 
                email: true, 
                role: true,
                first_name: true,
                last_name: true
            }
            });

        } catch (err) {
            console.error('User creation error:', err);
            
            if (err.code === 'P2002') {
            throw new BadRequestException('Email already exists');
            }
            
            if (err instanceof BadRequestException) {
            throw err; // Re-throw existing BadRequestExceptions
            }
            
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    async uploadFile(file: Express.Multer.File) {
    try {
        // Example for local storage (adjust for your storage solution)
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadDir, fileName);
        
        await fs.promises.writeFile(filePath, file.buffer);
        
        return {
        uri: `/uploads/${fileName}`, // Adjust this to your public URL
        fileName,
        size: file.size,
        mimetype: file.mimetype
        };
    } catch (error) {
        console.error('File upload error:', error);
        throw new Error('Failed to upload file');
    }
    }

    async uploadMultipleProductImages(files: Express.Multer.File[]) {
    return Promise.all(files.map(async (file) => {
        try {
        const result = await this.uploadFile(file);
        return { file: result };
        } catch (error) {
        console.error(`Upload failed for ${file.originalname}:`, error.message);
        return { 
            error: error.message,
            fileName: file.originalname
        };
        }
    }));
    }

    // PATCH (Update)
    async updateUser(id: number, dto: UpdateUserDto) {
        try {
        return await this.prisma.user.update({
            where: { id },
            data: {
            ...dto,
            updated_at: new Date() // Force update timestamp
            },
            select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            updated_at: true
            }
        });
        } catch (err) {
        this.handleError(err);
        }
    }

    // DELETE
    async deleteUser(id: number) {
        console.log(id)
        try {
        // Soft delete example (set deleted_at)
        return await this.prisma.user.delete({
            where: { id },
        });
        
        // For hard delete:
        // return await this.prisma.user.delete({ where: { id } });
        } catch (err) {
        if (err.code === 'P2025') {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        this.handleError(err);
        }
    }

    private handleError(err: any) {
        if (err instanceof NotFoundException) throw err;
        throw new BadRequestException(err.message);
    }

}