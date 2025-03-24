import { z } from 'zod';

const PreBookingSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    waitingTime: z.string().optional(),
    serviceType: z.string().optional(),
    affiliateId: z.string().min(1, 'Affiliate ID is required'),
});

export { PreBookingSchema };
