// ===========================================================================>> Core Library
import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';

// ===========================================================================>> Third Party Library
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
// ===========================================================================>> Costom Library
// Model
import jwtConstants from 'src/app/shared/jwt/constants';
import { UserPayload } from 'src/app/shared/user.payload';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginRequestDto } from './dto';

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService) { }

    async login(body: LoginRequestDto, req: Request) {
        // Find user by phone or email
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { phone: body.username },
                    { email: body.username }
                ],
                is_active: 1
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                phone: true,
                email: true,
                password: true,
                created_at: true,
                roles: {
                    select: {
                        is_default: true,
                        role: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new BadRequestException('Invalid credentials');
        }

        if (!user.roles.length) {
            throw new ForbiddenException('Cannot access. Invalid role');
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(body.password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid password', 'Password Error');
        }

        // Prepare the payload
        const payload: UserPayload = {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            avatar: user.avatar,
            roles: user.roles.map(r => ({
                id: r.role.id,
                name: r.role.name,
                is_default: r.is_default,
            })),
        };

        // Generate JWT token
        const token = jwt.sign({ user: payload }, jwtConstants.secret, {
            expiresIn: '5d', // Token valid for 5 days
        });

        // Update last login timestamp
        await this.prisma.user.update({
            where: { id: user.id },
            data: { last_login: new Date() },
        });

        return {
            status_code: 200,
            user: payload,
            token: token,
            message: 'Login successful',
        };
    }


    async switchDefaultRole(auth: { id: number }, role_id: number) {
        try {
            // Check if the user has the given role
            const userRole = await this.prisma.user_Role.findFirst({
                where: { user_id: auth.id, role_id: role_id },
                include: { role: true },
            });

            if (!userRole) {
                throw new BadRequestException('The specified role is not associated with the user.');
            }

            // If the role is already default, return a new token
            if (userRole.is_default) {
                const token = await this.generateToken(auth.id);
                return {
                    token,
                    message: 'This role is already set as default.',
                };
            }

            // Start transaction to update roles
            await this.prisma.$transaction([
                this.prisma.user_Role.updateMany({
                    where: { user_id: auth.id, is_default: true },
                    data: { is_default: false },
                }),
                this.prisma.user_Role.update({
                    where: { id: userRole.id },
                    data: { is_default: true },
                }),
            ]);

            // Generate new token after switching role
            const token = await this.generateToken(auth.id);

            return {
                token,
                message: 'User default role has been switched successfully.',
            };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('An error occurred while switching the default role.');
        }
    }

    private async generateToken(userId: number): Promise<string> {
        // Fetch user with roles
        const user = await this.prisma.user.findFirst({
            where: { id: userId, is_active: 1 },
            select: {
                id: true,
                name: true,
                avatar: true,
                phone: true,
                email: true,
                roles: {
                    select: {
                        is_default: true,
                        role: {
                            select: { id: true, name: true, slug: true },
                        },
                    },
                },
            },
        });

        if (!user || !user.roles.length) {
            throw new InternalServerErrorException('User roles are missing or not properly loaded.');
        }

        // Prepare payload
        const payload: UserPayload = {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            avatar: user.avatar,
            roles: user.roles.map(r => ({
                id: r.role.id,
                name: r.role.name,
                is_default: r.is_default,
            })),
        };

        // Generate JWT token
        return jwt.sign({ user: payload }, jwtConstants.secret, { expiresIn: '5d' });
    }
}
