import { z } from 'zod';

const PreBookingSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email format'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    waitingTime: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    street: z.string().optional(),
    zipCode: z.string().optional(),
    affiliateId: z.string().min(1, 'Affiliate ID is required'),
});

export { PreBookingSchema };
