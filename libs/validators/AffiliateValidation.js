import { z } from "zod";


const affiliateRegistrationSchema = z.object({
    name: z.string().min(1, "Name is required").max(50, "Name is too long"),
    email: z.string().email("Invalid email address"),
    phone: z.string(),
    street : z.string().optional(),
    city : z.string().optional(),
    state : z.string().optional(),
    country : z.string().optional(),
    zipCode : z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

export { affiliateRegistrationSchema };