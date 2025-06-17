import { PrismaClient } from '@prisma/client';

export class CreditCardSeed {
    private static prisma = new PrismaClient();
    
    // public static async clear() {
    //     await this.prisma.creditCard.deleteMany({});
    //     console.log('🗑️ Cleared credit cards');
    // }

    public static async seed() {
        try {
            await this.prisma.$connect();

            // First ensure there are users to reference
            const users = await this.prisma.user.findMany();
            if (users.length === 0) {
                throw new Error('No users found. Please seed users first.');
            }

            await this.prisma.creditCard.createMany({
                data: [
                    {
                        user_id: 5,  // Reference first user
                        card_last4: '4242',
                        card_brand: 'Visa',
                        token: 'tok_visa_test', // Example test token
                        is_default: true
                    },
                    {
                        user_id: 6, // Fallback to first user if no second user
                        card_last4: '5555',
                        card_brand: 'Mastercard',
                        token: 'tok_mastercard_test',
                        is_default: false
                    }
                ],
                skipDuplicates: true,
            });

            console.log('✅ Credit cards seeded successfully');
        } catch (error) {
            console.error('🐞 Error seeding Credit Cards:', error);
            throw error;
        } finally {
            await this.prisma.$disconnect();
        }
    }
}