import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Adjust the path based on your project structure

@Injectable()
export class RoleExistsPipe implements PipeTransform {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type === 'body' && value?.role_id) {
      const roleId = value.role_id;

      // Query the database using Prisma to check if the role exists
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new BadRequestException(`Invalid role_id value: ${roleId}`);
      }
    }

    return value;
  }
}
