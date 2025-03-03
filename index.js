import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from "helmet";
import xss from 'xss-clean';
import sanitize from 'express-mongo-sanitize';
import { routes } from './app/routes/routes.js';
import bootstrap from './config/server/bootstrap.js';
import { registerRoutes } from './config/server/registerRoutes.js';
import requestLogger from './config/logger/requestLogger.js';
import upload from './config/multer/multerConfig.js';
import handleRouteNotFound from './app/routes/handleRouteNotFound.js';
import handleGlobalErrors from './config/errors/handleGlobalErrors.js';

const app = express();


const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://yolast.vercel.app',
]


// CORS setup for multiple allowed origins
const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            // Allow the request if the origin is in the allowedOrigins list or if no origin is provided
            callback(null, true);
        } else {
            // Reject the request if the origin is not in the allowed list
            callback(new Error('Not allowed by CORS'));
        }
    },
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(sanitize());
app.use(xss());
app.use(helmet());
app.use(requestLogger);

// multer configure
app.use(
    upload.fields([
        { name: "single", maxCount: 1 },
        { name: "multiple", maxCount: 10 },
    ])
);

// files route
app.use('/public', express.static('public'));

// Welcome route
app.get('/', (req, res) => {
    const filePath = path.join(process.cwd(), 'public', 'html', 'index.html');
    res.sendFile(filePath);
});

// Register all routes under `/api`
registerRoutes(app, '/api', routes);

// Global error handler (should be before RouteNotFound)
app.use((err, req, res, next) => {
    handleGlobalErrors(err, req, res, next);
});

// Handle route not found (should be the last middleware)
app.use(handleRouteNotFound);

// Server & database



bootstrap(app);

export default app;