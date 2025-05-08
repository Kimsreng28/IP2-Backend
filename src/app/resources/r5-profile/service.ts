// ===========================================================================>> Core Library
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from './dto/create_address.dto';
import { UpdateAddressDto } from './dto/update_address.dto';

// ===========================================================================>> Third Party Library

// ===========================================================================>> Custom Library
@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getAllProfilesWithAddress() {}

  async getUserAddresses(userId: number) {
    try {
      return await this.prisma.address.findMany({
        where: { user_id: userId },
        orderBy: { is_default: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  }

  async createAddress(userId: number, createAddressDto: CreateAddressDto) {
    try {
      // If setting as default, first unset any existing default
      if (createAddressDto.is_default) {
        await this.prisma.address.updateMany({
          where: { user_id: userId, is_default: true },
          data: { is_default: false },
        });
      }

      return await this.prisma.address.create({
        data: {
          ...createAddressDto,
          user_id: userId,
        },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              avatar: true,
              role: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }

  async updateAddress(
    userId: number,
    addressId: number,
    updateDto: UpdateAddressDto,
  ) {
    try {
      if (updateDto.is_default) {
        await this.prisma.address.updateMany({
          where: { user_id: userId, is_default: true },
          data: { is_default: false },
        });
      }

      return await this.prisma.address.update({
        where: { id: addressId },
        data: {
          ...updateDto,
          user_id: userId,
        },
      });
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  async deleteAddress(userId: number, addressId: number) {
    try {
      const address = await this.prisma.address.findFirst({
        where: { id: addressId, user_id: userId },
      });

      if (!address) {
        throw new Error('Address not found or not owned by user');
      }

      return await this.prisma.address.delete({
        where: { id: addressId },
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }
}
