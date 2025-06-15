import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaClient, VendorEvent } from '@prisma/client';
import * as moment from 'moment';
import { FileService } from 'src/app/services/file.service';
import { CreateEventDto, UpdateEventDto } from './dto';

@Injectable()
export class VendorEventService {
  private prisma: PrismaClient;

  constructor(private readonly fileService: FileService) {
    this.prisma = new PrismaClient();
  }

  // async setUpData(): Promise<{ message: string; brands: any[]; categories: any[] }> {
  // async setUpData(authId: number): Promise<{ message: string; brands: any[]; categories: any[] }> {
  //     console.log('authId', authId);
  //     const brands = await this.prisma.brand.findMany();
  //     const categories = await this.prisma.category.findMany();

  //     return {
  //         message: 'Brands and Categories fetched successfully',
  //         brands,
  //         categories,
  //     };
  // }

  async getAllEvents(
    authId: number,
  ): Promise<{ events: VendorEvent[]; totalItems: number }> {
    try {
      // First, find the vendor associated with the authId (user_id)
      const vendor = await this.prisma.vendor.findUnique({
        where: { user_id: authId },
        select: { id: true },
      });

      if (!vendor) {
        throw new Error('Vendor not found');
      }

      // Build the where condition for vendor events
      const whereCondition: any = {
        vendor_id: vendor.id,
      };

      const [events, totalItems] = await Promise.all([
        this.prisma.vendorEvent.findMany({
          where: whereCondition,
          include: {
            vendor: true,
          },
        }),
        this.prisma.vendorEvent.count({ where: whereCondition }),
      ]);

      return {
        events,
        totalItems,
      };
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  async getEvent(authId: number, id: number): Promise<VendorEvent> {
    // First, find the vendor associated with the authId (user_id)
    const vendor = await this.prisma.vendor.findUnique({
      where: { user_id: authId },
      select: { id: true },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Check if the product exists and belongs to this vendor
    const vendorEvent = await this.prisma.vendorEvent.findFirst({
      where: {
        vendor_id: vendor.id,
        id: id,
      },
      include: {
        vendor: true,
      },
    });

    if (!vendorEvent) {
      throw new NotFoundException(
        `Event with ID ${id} not found or not associated with your vendor account`,
      );
    }

    return vendorEvent;
  }

  // async create(
  //     authUserId: number,
  //     dto: CreateEventDto,
  // ): Promise<{ data: VendorEvent; message: string }> {
  //     try {
  //         // 1. Verify the vendor exists and matches the authenticated user
  //         const vendor = await this.prisma.vendor.findUnique({
  //             where: { user_id: authUserId },
  //             select: { id: true },
  //         });

  //         if (!vendor) {
  //             throw new NotFoundException('Vendor account not found');
  //         }

  //         // 3. Create the event (vendor_id is taken from the verified vendor)
  //         const event = await this.prisma.vendorEvent.create({
  //             data: {
  //                 vendor_id: vendor.id, // Use the verified vendor ID
  //                 event_name: dto.event_name,
  //                 event_poster: dto.event_poster,
  //                 start_date: new Date(dto.start_date),
  //                 end_date: new Date(dto.end_date),
  //             },
  //             include: {
  //                 vendor: {
  //                     select: {
  //                         business_name: true,
  //                         business_email: true,
  //                     },
  //                 },
  //             },
  //         });

  //         return {
  //             data: event,
  //             message: 'Event created successfully',
  //         };
  //     } catch (error) {
  //         // Handle known errors
  //         if (error instanceof NotFoundException) {
  //             throw error;
  //         }

  //         // Log unexpected errors
  //         console.error('Error creating vendor event:', error);
  //         throw new InternalServerErrorException('Failed to create event');
  //     }
  // }

  // async create(userId: number, body: CreateEventDto) {
  //     // Step 1: Find the vendor by the authenticated user's ID
  //     const vendor = await this.prisma.vendor.findUnique({
  //         where: { user_id: userId },
  //     });

  //     if (!vendor) {
  //         throw new NotFoundException('Vendor not found for this user.');
  //     }

  //     // Step 2: Parse the start and end dates in either DD/MM/YYYY or DD-MM-YYYY format
  //     const startDate = moment(body.start_date, ['DD/MM/YYYY', 'DD-MM-YYYY'], true);
  //     const endDate = moment(body.end_date, ['DD/MM/YYYY', 'DD-MM-YYYY'], true);

  //     if (!startDate.isValid() || !endDate.isValid()) {
  //         throw new BadRequestException('Invalid date format. Use DD/MM/YYYY or DD-MM-YYYY.');
  //     }

  //     // Step 3: Create the event
  //     const event = await this.prisma.vendorEvent.create({
  //         data: {
  //             vendor_id: vendor.id,
  //             event_name: body.event_name,
  //             event_poster: body.event_poster,
  //             start_date: startDate.toDate(),
  //             end_date: endDate.toDate(),
  //         },
  //         include: {
  //             vendor: {
  //                 select: {
  //                     business_name: true,
  //                     business_email: true,
  //                 },
  //             },
  //         },
  //     });

  //     return {
  //         data: event,
  //         message: 'Vendor event created successfully',
  //     };
  // }

  async create(userId: number, dto: CreateEventDto) {
    try {
      const vendor = await this.prisma.vendor.findUnique({
        where: { user_id: userId },
      });

      if (!vendor) {
        throw new NotFoundException('Vendor not found for this user.');
      }

      const startDate = moment(
        dto.start_date,
        ['DD/MM/YYYY', 'DD-MM-YYYY'],
        true,
      );
      const endDate = moment(dto.end_date, ['DD/MM/YYYY', 'DD-MM-YYYY'], true);

      if (!startDate.isValid() || !endDate.isValid()) {
        throw new BadRequestException(
          'Invalid date format. Use DD/MM/YYYY or DD-MM-YYYY.',
        );
      }

      const event = await this.prisma.vendorEvent.create({
        data: {
          vendor_id: vendor.id,
          event_name: dto.event_name,
          event_poster: dto.event_poster,
          start_date: startDate.toDate(),
          end_date: endDate.toDate(),
        },
        include: {
          vendor: {
            select: {
              business_name: true,
              business_email: true,
            },
          },
        },
      });

      return {
        data: event,
        message: 'Vendor event created successfully',
      };
    } catch (err) {
      console.error('❌ Error while creating vendor event:', err);
      throw new InternalServerErrorException(
        'Something went wrong while creating the vendor event.',
      );
    }
  }

  async update(
    userId: number,
    eventId: number,
    dto: UpdateEventDto,
  ): Promise<{ data: VendorEvent; message: string }> {
    try {
      // 1. Find the vendor by user ID
      const vendor = await this.prisma.vendor.findUnique({
        where: { user_id: userId },
      });

      if (!vendor) {
        throw new NotFoundException('Vendor not found for this user.');
      }

      // 2. Check if the event exists and belongs to this vendor
      const existingEvent = await this.prisma.vendorEvent.findFirst({
        where: {
          id: eventId,
          vendor_id: vendor.id,
        },
      });

      if (!existingEvent) {
        throw new NotFoundException(
          'Event not found or you do not have permission to update it.',
        );
      }

      // 3. Parse and validate dates
      const startDate = moment(
        dto.start_date,
        ['DD/MM/YYYY', 'DD-MM-YYYY'],
        true,
      );
      const endDate = moment(dto.end_date, ['DD/MM/YYYY', 'DD-MM-YYYY'], true);

      if (!startDate.isValid() || !endDate.isValid()) {
        throw new BadRequestException(
          'Invalid date format. Use DD/MM/YYYY or DD-MM-YYYY.',
        );
      }

      // 4. Validate end date is after start date
      if (endDate.isBefore(startDate)) {
        throw new BadRequestException('End date must be after start date.');
      }

      // 5. Update the event
      const updatedEvent = await this.prisma.vendorEvent.update({
        where: { id: eventId },
        data: {
          event_name: dto.event_name,
          event_poster: dto.event_poster,
          start_date: startDate.toDate(),
          end_date: endDate.toDate(),
        },
        include: {
          vendor: {
            select: {
              business_name: true,
              business_email: true,
            },
          },
        },
      });

      return {
        data: updatedEvent,
        message: 'Event updated successfully',
      };
    } catch (err) {
      console.error('❌ Error while updating vendor event:', err);

      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Something went wrong while updating the event.',
      );
    }
  }

  async delete(authId: number, id: number): Promise<{ message: string }> {
    // 1. Find the vendor
    const vendor = await this.prisma.vendor.findUnique({
      where: { user_id: authId },
      select: { id: true },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // 2. Verify the product exists and belongs to this vendor
    const vendorProduct = await this.prisma.vendorProduct.findFirst({
      where: {
        vendor_id: vendor.id,
        product_id: id,
      },
      include: {
        product: true,
      },
    });

    if (!vendorProduct) {
      throw new NotFoundException(
        `Product with ID ${id} not found in your catalog`,
      );
    }

    // 3. Perform deletion in a transaction
    try {
      await this.prisma.$transaction(async (prisma) => {
        // Delete all related records
        await Promise.all([
          prisma.productImage.deleteMany({ where: { product_id: id } }),
          prisma.productCollection.deleteMany({ where: { product_id: id } }),
          prisma.productReview.deleteMany({ where: { product_id: id } }),
          prisma.productQuestion.deleteMany({ where: { product_id: id } }),
          prisma.discount.deleteMany({ where: { product_id: id } }),
          prisma.cart.deleteMany({ where: { product_id: id } }),
          prisma.orderItem.deleteMany({ where: { product_id: id } }),
          prisma.wishlist.deleteMany({ where: { product_id: id } }),
        ]);

        // Delete the vendor-product association
        await prisma.vendorProduct.deleteMany({ where: { product_id: id } });

        // Delete the product itself
        await prisma.product.delete({ where: { id } });
      });

      return { message: 'Product deleted successfully' };
    } catch (error) {
      // Handle specific Prisma errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          // Record not found
          throw new NotFoundException(`Product with ID ${id} not found`);
        }
      }
      throw new InternalServerErrorException(
        `Failed to delete product: ${error.message}`,
      );
    }
  }
}
