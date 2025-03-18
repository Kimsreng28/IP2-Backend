import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the path as needed

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getUsers(): Promise<any> {
    return await this.prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }
}
