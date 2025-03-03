import { AffiliateRoutes } from "./AffiliateRoutes.js";
import { BookingRoutes } from "./BookingRoutes.js";
import { ProductRoutes } from "./ProductRoutes.js";
import { UserRoutes } from "./UserRoutes.js";
import { ZohoRoutes } from "./ZohoRoutes.js";

// Define all routes
export const routes = [
    { path: '/zoho', router: ZohoRoutes },
    { path: '/affiliates', router: AffiliateRoutes },
    { path: '/booking', router: BookingRoutes },
    { path: '/user', router: UserRoutes },
    { path: '/product', router: ProductRoutes },
];