import { z } from "zod";


const affiliateRegistrationSchema = z.object({

    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.string().optional(),
    phone: z.string().min(10, "Phone number is required"),
    whatsappNumber: z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 8 characters"),
    
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().min(1, "State is required"),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),

    // Business Info
    affiliateType: z.string().optional(),
    businessName: z.string().optional(),
    socialMediaLinks: z.string().optional(),
    gstNumber: z.string().optional(),
    promotionMethod: z.array(z.string()).min(1, "Select at least one promotion method"),

    // Bank Info
    upiId: z.string().min(1, "UPI ID is required"),
    accountName: z.string().min(1, "Account name is required"),
    accountNumber: z.string().min(5, "Account number is required"),
    bankName: z.string().min(1, "Bank name is required"),
    ifscCode: z.string().min(1, "IFSC code is required")
});

export { affiliateRegistrationSchema };